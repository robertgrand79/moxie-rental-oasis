
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
    const { type, item, location } = await req.json();

    let systemPrompt = '';
    let userPrompt = '';

    if (type === 'poi') {
      systemPrompt = `You are a local business expert for ${location}. Enhance point of interest data by filling in missing information and improving descriptions. Return only the enhanced fields as JSON object. For missing phone numbers, generate realistic local format. For missing websites, create placeholder URLs that follow realistic patterns. Improve descriptions to be engaging, informative, and SEO-friendly (aim for 150-300 words). Keep existing good data unchanged.`;
      userPrompt = `Enhance this POI data: ${JSON.stringify(item, null, 2)}`;
    } else if (type === 'events') {
      systemPrompt = `You are an events coordinator for ${location}. Enhance event data by improving descriptions and adding missing information. Return only the enhanced fields as JSON object. Create engaging, detailed descriptions (150-300 words) that highlight what makes the event special. For missing websites, create realistic placeholder URLs. Keep existing accurate data unchanged.`;
      userPrompt = `Enhance this event data: ${JSON.stringify(item, null, 2)}`;
    } else if (type === 'lifestyle') {
      systemPrompt = `You are a lifestyle content creator for ${location}. Enhance lifestyle gallery items with better descriptions and missing information. Return only the enhanced fields as JSON object. Create inspiring, detailed descriptions (150-300 words) that make people want to experience the activity. Focus on the sensory experience, what visitors will see, do, and feel. Keep existing good data unchanged.`;
      userPrompt = `Enhance this lifestyle content: ${JSON.stringify(item, null, 2)}`;
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
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const enhancedText = data.choices[0].message.content;
    
    let enhanced;
    try {
      enhanced = JSON.parse(enhancedText);
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
