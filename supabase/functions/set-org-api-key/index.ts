
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { encryptApiKey } from "../_shared/encryption.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SetApiKeyRequest {
  organizationId: string;
  keyName: string;
  value: string;
}

const ALLOWED_KEYS = [
  'stripe_secret_key',
  'stripe_publishable_key',
  'stripe_webhook_secret',
  'seam_api_key',
  'pricelabs_api_key',
  'openphone_api_key',
  'resend_api_key',
  'turno_api_token',
  'turno_api_secret',
  'turno_partner_id',
  'apify_api_key',
  'openweather_api_key',
  'mapbox_api_key',
];

const handler = async (req: Request): Promise<Response> => {
  console.log('Set organization API key function called');

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

    const { organizationId, keyName, value }: SetApiKeyRequest = await req.json();

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

    // Encrypt the value before storing
    const encryptedValue = value ? await encryptApiKey(value) : null;

    // Update the organization
    const { error: updateError } = await supabaseClient
      .from('organizations')
      .update({ [keyName]: encryptedValue })
      .eq('id', organizationId);

    if (updateError) {
      console.error('Error updating API key:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update API key' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log the action for audit
    await supabaseClient
      .from('admin_audit_logs')
      .insert({
        admin_id: user.id,
        action: 'api_key_updated',
        table_name: 'organizations',
        record_id: organizationId,
        new_values: { key_name: keyName, masked: value ? '***' + value.slice(-4) : null }
      });

    console.log(`API key ${keyName} updated for org ${organizationId} by user ${user.id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'API key updated successfully'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in set-org-api-key function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
