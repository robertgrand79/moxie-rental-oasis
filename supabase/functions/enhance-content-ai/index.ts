import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

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

    // Use tool calling for structured JSON output
    const tools = [
      {
        type: "function",
        function: {
          name: "enhance_content",
          description: "Return enhanced content fields as structured data",
          parameters: {
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
        }
      }
    ];

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: tools,
        tool_choice: { type: "function", function: { name: "enhance_content" } },
        max_tokens: 2000,
      }),
    });

    if (response.status === 429) {
      console.error('Rate limit exceeded');
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (response.status === 402) {
      console.error('Payment required - AI credits exhausted');
      return new Response(JSON.stringify({ error: 'AI credits exhausted. Please contact support.' }), {
        status: 402,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    
    let enhanced;
    try {
      // Extract from tool call response
      const toolCall = data.choices[0]?.message?.tool_calls?.[0];
      if (toolCall && toolCall.function?.arguments) {
        enhanced = JSON.parse(toolCall.function.arguments);
      } else {
        // Fallback: try parsing message content directly
        const messageContent = data.choices[0]?.message?.content;
        if (messageContent) {
          enhanced = JSON.parse(messageContent);
        } else {
          throw new Error('No content in AI response');
        }
      }
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      throw new Error('Failed to parse AI response as JSON');
    }

    console.log(`Enhanced ${type} item: ${item.name || item.title}`);

    return new Response(JSON.stringify({ enhanced }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in enhance-content-ai function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Unknown error occurred',
      details: error.stack 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
