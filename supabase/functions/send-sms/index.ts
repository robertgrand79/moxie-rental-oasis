import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { decryptApiKey, isEncrypted } from "../_shared/encryption.ts";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendSMSRequest {
  to: string;
  message: string;
  from?: string;
  organizationId?: string;
  propertyId?: string;
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

    const { to, message, from, organizationId, propertyId }: SendSMSRequest = await req.json();

    if (!to || !message) {
      return new Response(
        JSON.stringify({ error: 'Phone number and message are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Get OpenPhone API key - check organization first, then fall back to global secret
    let openPhoneApiKey: string | null = null;
    let effectiveOrgId = organizationId;

    // If property provided but no org, look up org from property
    if (propertyId && !organizationId) {
      const { data: property } = await supabaseClient
        .from('properties')
        .select('organization_id')
        .eq('id', propertyId)
        .single();
      effectiveOrgId = property?.organization_id;
    }

    // Try to get org-level API key
    if (effectiveOrgId) {
      const { data: org } = await supabaseClient
        .from('organizations')
        .select('openphone_api_key')
        .eq('id', effectiveOrgId)
        .single();
      openPhoneApiKey = org?.openphone_api_key;
      if (openPhoneApiKey) {
        // Decrypt if stored encrypted
        if (isEncrypted(openPhoneApiKey)) {
          openPhoneApiKey = await decryptApiKey(openPhoneApiKey);
        }
        console.log('Using organization-level OpenPhone API key');
      }
    }

    // Fall back to global secret if no org key
    if (!openPhoneApiKey) {
      openPhoneApiKey = Deno.env.get('OPENPHONE_API_KEY');
      if (openPhoneApiKey) {
        console.log('Using global OpenPhone API key');
      }
    }
    
    if (!openPhoneApiKey) {
      throw new Error('QUO API key not configured. Please add your QUO API key in Organization Settings or Supabase dashboard.');
    }

    console.log(`📱 Sending SMS to ${to}: ${message.substring(0, 50)}...`);

    const payload = {
      to: [to],
      content: message, // QUO API uses 'content' not 'text'
      from: from || undefined, // Use default QUO number if not specified
    };

    // Track whether we used an org-level key first
    const usedOrgKeyFirst = !!effectiveOrgId && !!openPhoneApiKey;

    // Helper to actually send the SMS with a given key
    const sendWithKey = async (apiKey: string) => {
      return fetch('https://api.openphone.com/v1/messages', {
        method: 'POST',
        headers: {
          'Authorization': apiKey, // QUO API does NOT use Bearer prefix
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    };

    // First attempt with current key (org-level if present, otherwise global)
    let smsResponse = await sendWithKey(openPhoneApiKey);

    // If org-level key fails with 401, try falling back to global key once
    if (smsResponse.status === 401 && usedOrgKeyFirst) {
      const globalKey = Deno.env.get('OPENPHONE_API_KEY');
      if (globalKey && globalKey !== openPhoneApiKey) {
        console.warn('Org-level QUO API key failed with 401. Retrying with global OPENPHONE_API_KEY...');
        smsResponse = await sendWithKey(globalKey);
      }
    }

    if (!smsResponse.ok) {
      const errorText = await smsResponse.text();
      console.error(`❌ QUO API error: ${smsResponse.status} ${smsResponse.statusText}`, errorText);
      
      let errorMessage = 'Failed to send SMS';
      if (smsResponse.status === 401) {
        errorMessage = 'Invalid QUO API key. Please check your API key configuration.';
      } else if (smsResponse.status === 403) {
        errorMessage = 'QUO API access denied. Please check your account permissions.';
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