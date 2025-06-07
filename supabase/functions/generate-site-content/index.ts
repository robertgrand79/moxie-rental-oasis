
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
    const { prompt, context } = await req.json();

    const systemPrompt = `You are a professional copywriter specializing in vacation rental and hospitality websites. 
    
    Business Context:
    - Business Type: ${context.businessType}
    - Target Field: ${context.field}
    
    Current Site Content:
    - Site Name: ${context.currentContent.siteName}
    - Current Tagline: ${context.currentContent.tagline}
    - Current Description: ${context.currentContent.description}
    
    Instructions:
    - Generate compelling, professional content that matches the vacation rental industry
    - Keep the tone welcoming, trustworthy, and premium
    - For titles: Keep them concise and impactful (under 60 characters)
    - For descriptions: Make them informative and engaging (100-200 words)
    - For taglines: Keep them short and memorable (under 10 words)
    - Ensure the content is SEO-friendly and conversion-focused
    - Match the existing brand voice and style
    
    Return only the content requested, no additional formatting or explanations.`;

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
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content;

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-site-content function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
