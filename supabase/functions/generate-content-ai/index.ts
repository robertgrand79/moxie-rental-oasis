
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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

    if (type === 'poi') {
      systemPrompt = `You are a local expert for ${location}. Generate realistic points of interest data in JSON format. Each POI should include: name, description, address, category, phone (realistic local format), website_url (realistic but can be placeholder), rating (3.5-5.0), price_level (1-4), distance_from_properties (0.5-15 miles), driving_time (2-30 minutes). Make them authentic to ${location}.`;
      userPrompt = `Generate ${count} ${category} points of interest in ${location}. ${prompt}`;
    } else if (type === 'events') {
      systemPrompt = `You are an events coordinator for ${location}. Generate realistic event data in JSON format. Each event should include: title, description, event_date (future dates), end_date (if multi-day), time_start, time_end, location (specific venues in ${location}), category, price_range. Make events authentic to the area and seasonal.`;
      userPrompt = `Generate ${count} ${category} events for ${location}. ${prompt}`;
    } else if (type === 'lifestyle') {
      systemPrompt = `You are a lifestyle photographer and local guide for ${location}. Generate lifestyle gallery content in JSON format. Each item should include: title, description, category, location (specific places in ${location}), activity_type. Focus on authentic activities and experiences visitors would enjoy.`;
      userPrompt = `Generate ${count} ${category} lifestyle activities and experiences in ${location}. ${prompt}`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;
    
    let content;
    try {
      const parsed = JSON.parse(generatedText);
      // Ensure we have an array of content
      content = parsed.content || parsed.items || parsed[type] || [parsed];
      if (!Array.isArray(content)) {
        content = [content];
      }
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      throw new Error('Failed to parse AI response as JSON');
    }

    console.log(`Generated ${content.length} ${type} items for ${location}`);

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
