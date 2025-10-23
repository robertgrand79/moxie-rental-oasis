import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory = [] } = await req.json();

    console.log('Received chat request:', { message, historyLength: conversationHistory.length });

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

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
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
