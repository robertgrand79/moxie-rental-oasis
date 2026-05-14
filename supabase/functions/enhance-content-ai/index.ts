import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Anthropic from "npm:@anthropic-ai/sdk@^0.40.1";
import { CLAUDE_HAIKU, getAnthropicClient } from "../_shared/anthropicClient.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, item, location } = await req.json();

    let systemPrompt = '';
    let userPrompt = '';
    const requestLocation = location || 'your local area';

    if (type === 'poi') {
      systemPrompt = `You are a local business expert for ${requestLocation}. Enhance point of interest data by filling in missing information and improving descriptions. For missing phone numbers, generate realistic local format. For missing websites, create placeholder URLs that follow realistic patterns. Improve descriptions to be engaging, informative, and SEO-friendly (aim for 150-300 words). Keep existing good data unchanged.`;
      userPrompt = `Enhance this POI data: ${JSON.stringify(item, null, 2)}`;
    } else if (type === 'events') {
      systemPrompt = `You are an events coordinator for ${requestLocation}. Enhance event data by improving descriptions and adding missing information. Create engaging, detailed descriptions (150-300 words) that highlight what makes the event special. For missing websites, create realistic placeholder URLs. Keep existing accurate data unchanged.`;
      userPrompt = `Enhance this event data: ${JSON.stringify(item, null, 2)}`;
    } else if (type === 'lifestyle') {
      systemPrompt = `You are a lifestyle content creator for ${requestLocation}. Enhance lifestyle gallery items with better descriptions and missing information. Create inspiring, detailed descriptions (150-300 words) that make people want to experience the activity. Focus on the sensory experience, what visitors will see, do, and feel. Keep existing good data unchanged.`;
      userPrompt = `Enhance this lifestyle content: ${JSON.stringify(item, null, 2)}`;
    }

    const tool: Anthropic.Tool = {
      name: "enhance_content",
      description: "Return enhanced content fields as structured data",
      input_schema: {
        type: "object",
        properties: {
          name: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          address: { type: "string" },
          category: { type: "string" },
          phone: { type: "string" },
          website_url: { type: "string" },
          rating: { type: "number" },
          price_level: { type: "number" },
          location: { type: "string" },
          activity_type: { type: "string" },
          event_date: { type: "string" },
          time_start: { type: "string" },
          time_end: { type: "string" },
          price_range: { type: "string" }
        }
      }
    };

    const anthropic = getAnthropicClient();
    let response: Anthropic.Message;
    try {
      response = await anthropic.messages.create({
        model: CLAUDE_HAIKU,
        max_tokens: 2000,
        system: systemPrompt,
        tools: [tool],
        tool_choice: { type: "tool", name: "enhance_content" },
        messages: [{ role: 'user', content: userPrompt }],
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

    const toolUseBlock = response.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
    );
    if (!toolUseBlock) {
      throw new Error('No tool_use block in AI response');
    }
    const enhanced = toolUseBlock.input as Record<string, unknown>;

    console.log(`Enhanced ${type} item: ${item.name || item.title}`);

    return new Response(JSON.stringify({ enhanced }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in enhance-content-ai function:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
