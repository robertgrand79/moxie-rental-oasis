import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { decryptApiKey, isEncrypted } from "../_shared/encryption.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

async function decryptIfNeeded(value: string | null): Promise<string | null> {
  if (!value) return null;
  if (isEncrypted(value)) {
    return await decryptApiKey(value);
  }
  return value;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🧪 Turno test function running...');

    let organizationId: string | null = null;
    try {
      const body = await req.json();
      organizationId = body.organizationId;
    } catch {
      // No body or invalid JSON
    }

    if (!organizationId) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Organization ID is required to test a Turno connection.',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: org, error: orgError } = await supabaseClient
      .from('organizations')
      .select('turno_api_token, turno_api_secret, turno_partner_id')
      .eq('id', organizationId)
      .single();

    if (orgError) {
      throw new Error('Failed to load organization Turno settings');
    }

    const turnoApiToken = await decryptIfNeeded(org?.turno_api_token);
    const turnoApiSecret = await decryptIfNeeded(org?.turno_api_secret);
    const turnoPartnerId = await decryptIfNeeded(org?.turno_partner_id);

    console.log('🔧 Credentials check:', {
      organizationId,
      hasToken: !!turnoApiToken,
      hasSecret: !!turnoApiSecret,
      hasPartnerId: !!turnoPartnerId,
    });

    if (!turnoApiToken || !turnoApiSecret) {
      return new Response(JSON.stringify({
        success: false,
        error: 'This organization must save its own Turno API token and secret before testing the connection.',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${turnoApiSecret}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (turnoPartnerId) {
      headers['TBNB-Partner-ID'] = turnoPartnerId;
    }

    let response = await fetch('https://api.turnoverbnb.com/v2/properties', {
      method: 'GET',
      headers,
    });

    if (!response.ok && response.status === 401) {
      const authString = btoa(`${turnoApiToken}:${turnoApiSecret}`);
      const basicHeaders: Record<string, string> = {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      if (turnoPartnerId) {
        basicHeaders['TBNB-Partner-ID'] = turnoPartnerId;
      }

      response = await fetch('https://api.turnoverbnb.com/v2/properties', {
        method: 'GET',
        headers: basicHeaders,
      });
    }

    const isSuccess = response.ok;
    const message = isSuccess
      ? 'Turno API connection test successful'
      : `API test failed: ${response.status} ${response.statusText}`;

    return new Response(JSON.stringify({
      success: isSuccess,
      message,
      status: response.status,
      organizationId,
      timestamp: new Date().toISOString(),
    }), {
      status: isSuccess ? 200 : 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error: any) {
    console.error('❌ Test function error:', error);

    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      message: 'Test function failed',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);
