import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Anthropic from "npm:@anthropic-ai/sdk@^0.40.1";
import { CLAUDE_HAIKU, getAnthropicClient, extractText } from "../_shared/anthropicClient.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory = [] } = await req.json();

    console.log('Received unified AI chat request:', { message, historyLength: conversationHistory.length });

    const systemPrompt = `You are an AI content assistant for a vacation rental website. You help with:

1. **Content Generation**: Create POI (points of interest), events, lifestyle content, and website copy
2. **Content Enhancement**: Improve existing content with better descriptions, missing information
3. **Site Management**: Help with website text, meta descriptions, and content strategy
4. **Data Analysis**: Review existing content and suggest improvements

**Available Actions:**
- Generate new content (POI, events, lifestyle, site copy)
- Enhance existing content by filling gaps and improving quality
- Provide content suggestions and strategy advice
- Help with SEO optimization

**Response Format:**
- Provide helpful, conversational responses
- When generating content, indicate what type you're creating
- Suggest follow-up actions when appropriate
- Be proactive in identifying content improvement opportunities

**Content Types:**
- **POI**: Local attractions, restaurants, shops with name, description, address, category
- **Events**: Local events with title, description, date, location, category
- **Lifestyle**: Experience content with title, description, category, activity type
- **Site Content**: Website copy, meta descriptions, page content

Always be helpful, proactive, and focused on creating high-quality content for vacation rental guests.`;

    const contentTypeMatch = message.toLowerCase();
    let shouldGenerateContent = false;
    let contentType = '';
    let suggestions = [];

    if (contentTypeMatch.includes('poi') || contentTypeMatch.includes('point') || contentTypeMatch.includes('attraction') || contentTypeMatch.includes('restaurant')) {
      shouldGenerateContent = true;
      contentType = 'poi';
      suggestions = ['Enhance existing POI data', 'Generate more restaurants', 'Create outdoor activities'];
    } else if (contentTypeMatch.includes('event') || contentTypeMatch.includes('festival') || contentTypeMatch.includes('activity')) {
      shouldGenerateContent = true;
      contentType = 'events';
      suggestions = ['Create seasonal events', 'Generate cultural activities', 'Add family-friendly events'];
    } else if (contentTypeMatch.includes('lifestyle') || contentTypeMatch.includes('experience') || contentTypeMatch.includes('gallery')) {
      shouldGenerateContent = true;
      contentType = 'lifestyle';
      suggestions = ['Create outdoor experiences', 'Generate cultural content', 'Add local lifestyle activities'];
    } else if (contentTypeMatch.includes('site') || contentTypeMatch.includes('copy') || contentTypeMatch.includes('website') || contentTypeMatch.includes('text')) {
      shouldGenerateContent = true;
      contentType = 'site-content';
      suggestions = ['Improve homepage copy', 'Optimize meta descriptions', 'Enhance property descriptions'];
    } else {
      suggestions = ['Generate local attractions', 'Create upcoming events', 'Enhance existing content', 'Improve website copy'];
    }

    const messages: Anthropic.MessageParam[] = [
      ...conversationHistory.map((m: ChatMessage) => ({
        role: m.role === 'assistant' ? 'assistant' as const : 'user' as const,
        content: m.content,
      })),
      { role: 'user', content: message },
    ];

    const anthropic = getAnthropicClient();
    let response: Anthropic.Message;
    try {
      response = await anthropic.messages.create({
        model: CLAUDE_HAIKU,
        max_tokens: 1000,
        system: systemPrompt,
        messages,
      });
    } catch (error) {
      if (error instanceof Anthropic.RateLimitError) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (error instanceof Anthropic.APIError) {
        console.error('Anthropic API error:', error.status, error.message);
        return new Response(JSON.stringify({
          error: `AI request failed (${error.status}): ${error.message}`,
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw error;
    }

    const aiResponse = extractText(response);

    let generatedContent = null;

    if (shouldGenerateContent && (contentTypeMatch.includes('generate') || contentTypeMatch.includes('create'))) {
      if (contentType === 'poi') {
        generatedContent = {
          type: 'poi',
          data: [
            {
              name: 'Local Saturday Market',
              description: 'A vibrant outdoor market featuring local artisans, fresh produce, and live music. Open year-round on Saturdays, this beloved institution showcases the best of local culture and craftsmanship.',
              address: 'Downtown Area',
              category: 'shopping',
              phone: '(555) 123-4567',
              website_url: 'https://example.com/market',
              rating: 4.8,
              price_level: 2
            }
          ],
          preview: 'Generated 1 POI: Local Saturday Market - A vibrant outdoor market featuring local artisans...'
        };
      } else if (contentType === 'events') {
        generatedContent = {
          type: 'events',
          data: [
            {
              title: 'Annual Arts Festival',
              description: 'An annual three-day festival celebrating arts, crafts, music, and community. Experience unique performances, artisan crafts, and delicious food.',
              event_date: '2024-07-12',
              end_date: '2024-07-14',
              location: 'Downtown Area',
              category: 'festival',
              price_range: '$25-50'
            }
          ],
          preview: 'Generated 1 Event: Annual Arts Festival - An annual three-day festival celebrating arts...'
        };
      }
    }

    console.log('AI response generated successfully');

    return new Response(JSON.stringify({ 
      response: aiResponse,
      suggestions: suggestions,
      generatedContent: generatedContent
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-unified-chat function:', error);
    return new Response(JSON.stringify({ error: 'Failed to process chat request' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
