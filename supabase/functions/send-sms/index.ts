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

    // Format phone number to E.164 format (must start with +)
    let formattedTo = to.trim();
    if (!formattedTo.startsWith('+')) {
      // Assume US number if no country code
      formattedTo = formattedTo.startsWith('1') ? `+${formattedTo}` : `+1${formattedTo}`;
    }

    // Get the "from" phone number - required by QUO API
    let fromPhoneId = from;
    if (!fromPhoneId && effectiveOrgId) {
      const { data: org } = await supabaseClient
        .from('organizations')
        .select('openphone_phone_number')
        .eq('id', effectiveOrgId)
        .single();
      fromPhoneId = org?.openphone_phone_number;
    }

    if (!fromPhoneId) {
      throw new Error('No sender phone number configured. Please add your QUO phone number ID in Organization Settings.');
    }

    console.log(`📱 Sending SMS from ${fromPhoneId} to ${formattedTo}: ${message.substring(0, 50)}...`);

    const payload = {
      to: [formattedTo],
      content: message,
      from: fromPhoneId,
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

      // Try to provide more specific QUO error messages
      try {
        const parsed = JSON.parse(errorText);
        const errors = parsed?.errors as Array<{ path?: string; message?: string }> | undefined;

        if (Array.isArray(errors)) {
          const fromError = errors.find((e) => e.path === '/from');
          const toError = errors.find((e) => e.path === '/to/0');

          if (fromError) {
            errorMessage = 'Invalid QUO sender ID. Please use the Phone Number ID from QUO (starts with "PN") in Organization Settings.';
          } else if (toError) {
            errorMessage = 'Invalid recipient phone number. QUO requires E.164 format like +15415551234.';
          }
        }
      } catch {
        // If parsing fails, fall back to generic message set above
      }

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

    // Store the outbound SMS in guest_communications if we have context
    // Note: This requires the caller to provide reservationId and threadId
    // For now, the send-sms function focuses on sending - storage is handled by the caller

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