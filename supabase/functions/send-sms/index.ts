
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendSMSRequest {
  to: string;
  message: string;
  from?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const openPhoneApiKey = Deno.env.get('OPENPHONE_API_KEY');
    
    if (!openPhoneApiKey) {
      throw new Error('OPENPHONE_API_KEY not configured. Please add your OpenPhone API key in the Supabase dashboard.');
    }

    const { to, message, from }: SendSMSRequest = await req.json();

    if (!to || !message) {
      return new Response(
        JSON.stringify({ error: 'Phone number and message are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log(`📱 Sending SMS to ${to}: ${message.substring(0, 50)}...`);

    // Send SMS via OpenPhone API
    const smsResponse = await fetch('https://api.openphone.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openPhoneApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: [to],
        text: message,
        from: from || undefined, // Use default OpenPhone number if not specified
      }),
    });

    if (!smsResponse.ok) {
      const errorText = await smsResponse.text();
      console.error(`❌ OpenPhone API error: ${smsResponse.status} ${smsResponse.statusText}`, errorText);
      
      let errorMessage = 'Failed to send SMS';
      if (smsResponse.status === 401) {
        errorMessage = 'Invalid OpenPhone API key. Please check your API key configuration.';
      } else if (smsResponse.status === 403) {
        errorMessage = 'OpenPhone API access denied. Please check your account permissions.';
      } else if (smsResponse.status === 429) {
        errorMessage = 'SMS rate limit exceeded. Please try again later.';
      }
      
      throw new Error(errorMessage);
    }

    const smsResult = await smsResponse.json();
    console.log('✅ SMS sent successfully:', smsResult);

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: smsResult.id,
        message: 'SMS sent successfully' 
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('❌ SMS sending error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Failed to send SMS'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);
