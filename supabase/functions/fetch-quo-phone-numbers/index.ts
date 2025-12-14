import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { organizationId } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get organization's QUO API key
    let quoApiKey: string | null = null;

    if (organizationId) {
      const { data: org } = await supabase
        .from('organizations')
        .select('openphone_api_key')
        .eq('id', organizationId)
        .single();

      if (org?.openphone_api_key) {
        // Decrypt if encrypted
        const { decryptApiKey, isEncrypted } = await import('../_shared/encryption.ts');
        quoApiKey = isEncrypted(org.openphone_api_key) 
          ? await decryptApiKey(org.openphone_api_key)
          : org.openphone_api_key;
      }
    }

    // Fallback to global key
    if (!quoApiKey) {
      quoApiKey = Deno.env.get('OPENPHONE_API_KEY');
    }

    if (!quoApiKey) {
      return new Response(
        JSON.stringify({ error: 'QUO API key not configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[fetch-quo-phone-numbers] Fetching phone numbers from QUO API');

    const response = await fetch('https://api.openphone.com/v1/phone-numbers', {
      method: 'GET',
      headers: {
        'Authorization': quoApiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[fetch-quo-phone-numbers] QUO API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: `QUO API error: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('[fetch-quo-phone-numbers] Found phone numbers:', data.data?.length || 0);

    // Map to simplified format
    const phoneNumbers = (data.data || []).map((pn: any) => ({
      id: pn.id,
      formattedNumber: pn.formattedNumber || pn.number,
      name: pn.name || pn.symbol || 'Unnamed',
    }));

    return new Response(
      JSON.stringify({ phoneNumbers }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[fetch-quo-phone-numbers] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
