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
    const { type, prompt, category, count, location, context } = await req.json();

    let systemPrompt = '';
    let userPrompt = '';
    const requestCount = count || 5;
    const requestLocation = location || 'your local area';

    if (type === 'poi') {
      systemPrompt = `You are a local expert for ${requestLocation}. Generate realistic points of interest data. Each POI should include: name, description, address, category, phone (realistic local format), website_url (realistic but can be placeholder), rating (3.5-5.0), price_level (1-4), distance_from_properties (0.5-15 miles), driving_time (2-30 minutes). Make them authentic to ${requestLocation}. Return a JSON object with an "items" array containing the POIs.`;
      userPrompt = `Generate ${requestCount} ${category} points of interest in ${requestLocation}. ${prompt}`;
    } else if (type === 'events') {
      systemPrompt = `You are an events coordinator for ${requestLocation}. Generate realistic event data. Each event should include: title, description, event_date (future dates in YYYY-MM-DD format), end_date (if multi-day), time_start, time_end, location (specific venues in ${requestLocation}), category, price_range. Make events authentic to the area and seasonal. Return a JSON object with an "items" array containing the events.`;
      userPrompt = `Generate ${requestCount} ${category} events for ${requestLocation}. ${prompt}`;
    } else if (type === 'lifestyle') {
      systemPrompt = `You are a lifestyle photographer and local guide for ${requestLocation}. Generate lifestyle gallery content. Each item should include: title, description, category, location (specific places in ${requestLocation}), activity_type, image_url (relevant Unsplash URL like https://images.unsplash.com/photo-...), display_order, is_featured (boolean), is_active (boolean, default true). Focus on authentic activities and experiences visitors would enjoy. Return a JSON object with an "items" array containing the lifestyle items.`;
      userPrompt = `Generate ${requestCount} ${category || 'lifestyle'} activities and experiences in ${requestLocation}. ${prompt}`;
    }

    // Use tool calling for structured JSON output
    const tools = [
      {
        type: "function",
        function: {
          name: "generate_content",
          description: `Generate ${type} content items as structured data`,
          parameters: {
            type: "object",
            properties: {
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: type === 'poi' ? {
                    name: { type: "string" },
                    description: { type: "string" },
                    address: { type: "string" },
                    category: { type: "string" },
                    phone: { type: "string" },
                    website_url: { type: "string" },
                    rating: { type: "number" },
                    price_level: { type: "number" },
                    distance_from_properties: { type: "number" },
                    driving_time: { type: "number" }
                  } : type === 'events' ? {
                    title: { type: "string" },
                    description: { type: "string" },
                    event_date: { type: "string" },
                    end_date: { type: "string" },
                    time_start: { type: "string" },
                    time_end: { type: "string" },
                    location: { type: "string" },
                    category: { type: "string" },
                    price_range: { type: "string" }
                  } : {
                    title: { type: "string" },
                    description: { type: "string" },
                    category: { type: "string" },
                    location: { type: "string" },
                    activity_type: { type: "string" },
                    image_url: { type: "string" },
                    display_order: { type: "number" },
                    is_featured: { type: "boolean" },
                    is_active: { type: "boolean" }
                  }
                }
              }
            },
            required: ["items"]
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
        tool_choice: { type: "function", function: { name: "generate_content" } },
        max_tokens: 4000,
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
    
    let content;
    try {
      // Extract from tool call response
      const toolCall = data.choices[0]?.message?.tool_calls?.[0];
      if (toolCall && toolCall.function?.arguments) {
        const parsed = JSON.parse(toolCall.function.arguments);
        content = parsed.items || [];
      } else {
        // Fallback: try parsing message content directly
        const messageContent = data.choices[0]?.message?.content;
        if (messageContent) {
          const parsed = JSON.parse(messageContent);
          content = parsed.items || parsed.content || parsed[type] || [parsed];
        } else {
          content = [];
        }
      }
      
      if (!Array.isArray(content)) {
        content = [content];
      }
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      throw new Error('Failed to parse AI response as JSON');
    }

    console.log(`Generated ${content.length} ${type} items for ${requestLocation}`);

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-content-ai function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Unknown error occurred',
      details: error.stack 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
