
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { decryptApiKey, isEncrypted } from "../_shared/encryption.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GetApiKeyRequest {
  organizationId: string;
  keyName: string;
}

const ALLOWED_KEYS = [
  'stripe_secret_key',
  'stripe_publishable_key',
  'stripe_webhook_secret',
  'seam_api_key',
  'pricelabs_api_key',
  'openphone_api_key',
  'resend_api_key',
  'turno_api_key',
  'apify_api_key',
  'openweather_api_key',
  'mapbox_api_key',
];

const handler = async (req: Request): Promise<Response> => {
  console.log('Get organization API key function called');

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { organizationId, keyName }: GetApiKeyRequest = await req.json();

    if (!organizationId || !keyName) {
      return new Response(
        JSON.stringify({ error: 'Organization ID and key name are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!ALLOWED_KEYS.includes(keyName)) {
      return new Response(
        JSON.stringify({ error: 'Invalid key name' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify user is organization admin
    const { data: membership, error: membershipError } = await supabaseClient
      .from('organization_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', organizationId)
      .single();

    // Check if platform admin
    const { data: platformAdmin } = await supabaseClient
      .from('platform_admins')
      .select('id')
      .eq('user_id', user.id)
      .single();

    const isPlatformAdmin = !!platformAdmin;
    const isOrgAdmin = membership && ['owner', 'admin'].includes(membership.role);

    if (!isPlatformAdmin && !isOrgAdmin) {
      return new Response(
        JSON.stringify({ error: 'Organization admin privileges required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch the specific key
    const { data: org, error: orgError } = await supabaseClient
      .from('organizations')
      .select(keyName)
      .eq('id', organizationId)
      .single();

    if (orgError || !org) {
      return new Response(
        JSON.stringify({ error: 'Organization not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let value = (org as any)[keyName] || '';
    
    // Decrypt if encrypted
    if (value && isEncrypted(value)) {
      value = await decryptApiKey(value);
    }

    // Log access for audit
    console.log(`API key ${keyName} accessed for org ${organizationId} by user ${user.id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        value
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-org-api-key function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
