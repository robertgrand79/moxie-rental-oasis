
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

    const getSystemPrompt = (category: string) => {
      const baseContext = `
      Business Context:
      - Business Type: ${context.businessType}
      - Target Field: ${context.field}
      
      Current Site Content:
      - Site Name: ${context.currentContent.siteName}
      - Current Tagline: ${context.currentContent.tagline}
      - Current Description: ${context.currentContent.description}
      `;

      switch (category) {
        case 'content':
          return `You are a professional copywriter specializing in vacation rental and hospitality websites. 
          
          ${baseContext}
          
          Instructions:
          - Generate compelling, professional content that matches the vacation rental industry
          - Keep the tone welcoming, trustworthy, and premium
          - For titles: Keep them concise and impactful (under 60 characters)
          - For descriptions: Make them informative and engaging (100-200 words)
          - For taglines: Keep them short and memorable (under 10 words)
          - Ensure the content is SEO-friendly and conversion-focused
          - Match the existing brand voice and style
          
          Return only the content requested, no additional formatting or explanations.`;

        case 'contact':
          return `You are a professional business consultant specializing in vacation rental contact information.
          
          ${baseContext}
          
          Instructions:
          - Generate professional, trustworthy contact information
          - For emails: Use professional domain-based formats
          - For phone numbers: Use proper formatting with area codes
          - For addresses: Create realistic business addresses appropriate for vacation rentals
          - Maintain consistency with the existing brand
          
          Return only the content requested, no additional formatting or explanations.`;

        case 'seo':
          return `You are an SEO specialist focusing on vacation rental websites.
          
          ${baseContext}
          
          Instructions:
          - Generate SEO-optimized content for vacation rental businesses
          - For meta descriptions: Keep under 160 characters, include key benefits
          - For keywords: Focus on vacation rental, location-based, and hospitality terms
          - For site names: Make them brandable and search-friendly
          - Include relevant industry keywords naturally
          
          Return only the content requested, no additional formatting or explanations.`;

        case 'pages':
          return `You are a professional web content writer specializing in vacation rental websites.
          
          ${baseContext}
          
          Instructions:
          - Generate complete page content including title, subtitle, and main content
          - Structure content with clear headings and sections
          - Keep the tone professional, welcoming, and trustworthy
          - Include relevant information for vacation rental guests/customers
          - Make content comprehensive but scannable
          - Ensure content is engaging and informative
          
          Format the response with clear sections:
          - Page Title: [title]
          - Subtitle: [subtitle]  
          - Content: [main content with proper paragraphs]
          
          Return only the formatted content, no additional explanations.`;

        default:
          return `You are a professional copywriter specializing in vacation rental and hospitality websites. 
          
          ${baseContext}
          
          Generate professional, engaging content that matches the vacation rental industry.
          Return only the content requested, no additional formatting or explanations.`;
      }
    };

    const systemPrompt = getSystemPrompt(context.category || 'content');

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
        max_tokens: context.category === 'pages' ? 1500 : 500,
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
