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
    const { type, prompt, category, count, location } = await req.json();

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

    const itemProperties = type === 'poi' ? {
      name: { type: "string" },
      description: { type: "string" },
      address: { type: "string" },
      category: { type: "string" },
      phone: { type: "string" },
      website_url: { type: "string" },
      rating: { type: "number" },
      price_level: { type: "number" },
      distance_from_properties: { type: "number" },
      driving_time: { type: "number" },
    } : type === 'events' ? {
      title: { type: "string" },
      description: { type: "string" },
      event_date: { type: "string" },
      end_date: { type: "string" },
      time_start: { type: "string" },
      time_end: { type: "string" },
      location: { type: "string" },
      category: { type: "string" },
      price_range: { type: "string" },
    } : {
      title: { type: "string" },
      description: { type: "string" },
      category: { type: "string" },
      location: { type: "string" },
      activity_type: { type: "string" },
      image_url: { type: "string" },
      display_order: { type: "number" },
      is_featured: { type: "boolean" },
      is_active: { type: "boolean" },
    };

    const tool: Anthropic.Tool = {
      name: "generate_content",
      description: `Generate ${type} content items as structured data`,
      input_schema: {
        type: "object",
        properties: {
          items: {
            type: "array",
            items: { type: "object", properties: itemProperties },
          },
        },
        required: ["items"],
      },
    };

    const anthropic = getAnthropicClient();
    let response: Anthropic.Message;
    try {
      response = await anthropic.messages.create({
        model: CLAUDE_HAIKU,
        max_tokens: 4000,
        system: systemPrompt,
        tools: [tool],
        tool_choice: { type: "tool", name: "generate_content" },
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
    const parsed = toolUseBlock.input as { items?: unknown[] };
    const content = Array.isArray(parsed.items) ? parsed.items : [parsed];

    console.log(`Generated ${content.length} ${type} items for ${requestLocation}`);

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-content-ai function:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
