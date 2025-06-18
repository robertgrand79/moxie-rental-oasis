
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getSystemPrompt } from './systemPrompts.ts';
import { enhanceParagraphStructure } from './contentProcessing.ts';
import { generateContentWithOpenAI, getMaxTokensForCategory } from './openaiConfig.ts';

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

    const systemPrompt = getSystemPrompt(context.category || 'content', context);
    const maxTokens = getMaxTokensForCategory(context.category);

    let content = await generateContentWithOpenAI(systemPrompt, prompt, maxTokens);

    // Post-process content to ensure proper paragraph structure
    if (context.category === 'blog') {
      content = enhanceParagraphStructure(content);
    }

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
