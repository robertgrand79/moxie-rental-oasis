import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkAIRateLimit, buildRateLimitResponse } from "../_shared/aiRateLimiting.ts";

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
    const { message, conversationHistory = [], organizationId } = await req.json();

    console.log('Received chat request:', { message, historyLength: conversationHistory.length, organizationId });

    // Check rate limit if organization ID is provided
    if (organizationId) {
      const supabaseUrl = Deno.env.get("SUPABASE_URL");
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      
      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        try {
          const rateLimitResult = await checkAIRateLimit(supabase, organizationId, 'admin_chat');
          if (!rateLimitResult.allowed) {
            console.log('Rate limit exceeded for org:', organizationId, rateLimitResult);
            return buildRateLimitResponse(rateLimitResult, corsHeaders);
          }
          console.log('Rate limit check passed:', rateLimitResult);
        } catch (rateLimitError) {
          console.error('Rate limit check failed:', rateLimitError);
          // Continue without rate limiting if check fails
        }
      }
    }

    const systemPrompt = `You are a helpful AI assistant for Moxie Travel, a vacation rental company in Eugene, Oregon. You help visitors with:

1. Information about vacation rental properties
2. Booking inquiries and processes
3. Local Eugene attractions and recommendations
4. Amenities and services offered
5. General travel advice for the Eugene area

Key information about Moxie Travel:
- We offer luxury vacation rentals in Eugene, Oregon
- Our properties include amenities like WiFi, kitchens, parking, and TV
- We focus on providing exceptional guest experiences
- Eugene is known for its natural beauty, outdoor activities, and university culture

Be friendly, helpful, and professional. If you don't know specific details about availability or pricing, direct users to contact Moxie Travel directly for the most current information.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: messages,
        max_tokens: 500,
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
    const aiResponse = data.choices[0].message.content;

    console.log('AI response generated successfully');

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(JSON.stringify({ error: 'Failed to process chat request' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
