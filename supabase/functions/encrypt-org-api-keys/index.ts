
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { encryptApiKey, isEncrypted } from "../_shared/encryption.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const API_KEY_COLUMNS = [
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
  console.log('Encrypt organization API keys function called');

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify platform admin
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if user is platform admin
      const { data: platformAdmin } = await supabaseClient
        .from('platform_admins')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!platformAdmin) {
        return new Response(
          JSON.stringify({ error: 'Platform admin privileges required' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Fetch all organizations with API keys
    const { data: orgs, error: orgsError } = await supabaseClient
      .from('organizations')
      .select('id, name, ' + API_KEY_COLUMNS.join(', '));

    if (orgsError) throw orgsError;

    let encryptedCount = 0;
    let skippedCount = 0;

    for (const org of orgs || []) {
      const updates: Record<string, string> = {};
      
      for (const column of API_KEY_COLUMNS) {
        const value = (org as any)[column];
        if (value && !isEncrypted(value)) {
          updates[column] = await encryptApiKey(value);
          encryptedCount++;
        } else if (value) {
          skippedCount++;
        }
      }

      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await supabaseClient
          .from('organizations')
          .update(updates)
          .eq('id', org.id);

        if (updateError) {
          console.error(`Failed to update org ${org.id}:`, updateError);
        } else {
          console.log(`Encrypted ${Object.keys(updates).length} keys for org: ${org.name}`);
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Encrypted ${encryptedCount} API keys, skipped ${skippedCount} already encrypted`,
        encrypted: encryptedCount,
        skipped: skippedCount
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in encrypt-org-api-keys function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
