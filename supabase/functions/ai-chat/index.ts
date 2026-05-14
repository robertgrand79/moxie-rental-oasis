import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Anthropic from "npm:@anthropic-ai/sdk@^0.40.1";
import { CLAUDE_HAIKU, getAnthropicClient, extractText } from "../_shared/anthropicClient.ts";
import { checkAiRateLimit, organizationIdFromAuth, rateLimitResponse } from "../_shared/aiRateLimit.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory = [], organizationId: bodyOrgId } = await req.json();

    console.log('Received chat request:', { message, historyLength: conversationHistory.length });

    // Prefer JWT-derived org (can't be spoofed). Fall back to body for callers
    // without a user session (e.g., TV interface paired by device, not user).
    const orgId = (await organizationIdFromAuth(req)) ?? bodyOrgId ?? null;
    const rateLimit = await checkAiRateLimit(orgId, "admin_assistant");
    if (!rateLimit.allowed) {
      return rateLimitResponse(rateLimit, corsHeaders);
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

    const messages: Anthropic.MessageParam[] = [
      ...conversationHistory.map((m: ChatMessage) => ({
        role: m.role === 'assistant' ? 'assistant' as const : 'user' as const,
        content: m.content,
      })),
      { role: 'user', content: message },
    ];

    const anthropic = getAnthropicClient();

    let response: Anthropic.Message;
    try {
      response = await anthropic.messages.create({
        model: CLAUDE_HAIKU,
        max_tokens: 500,
        system: systemPrompt,
        messages,
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

    const aiResponse = extractText(response);
    console.log('AI response generated successfully');

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-chat function:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Failed to process chat request',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
