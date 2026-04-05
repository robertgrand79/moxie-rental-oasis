import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProvisionRequest {
  organization_id: string;
  slug: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase credentials not configured');
    }

    const { organization_id, slug }: ProvisionRequest = await req.json();

    if (!organization_id || !slug) {
      return new Response(
        JSON.stringify({ error: 'organization_id and slug are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const hostname = `${slug}.staymoxie.com`;

    console.log(`[provision-subdomain] Provisioning subdomain: ${hostname}`);

    // For subdomains under staymoxie.com, we use wildcard DNS (already configured)
    // No need to call Cloudflare API - just mark as active since wildcard DNS handles routing
    // Vercel handles SSL for these subdomains automatically via wildcard domain

    // Update status to active - wildcard DNS handles the subdomain routing
    const { error: updateError } = await supabase
      .from('organizations')
      .update({ 
        subdomain_status: 'active',
        subdomain_error: null 
      })
      .eq('id', organization_id);

    if (updateError) {
      console.error('[provision-subdomain] Database update error:', updateError);
      throw new Error('Failed to update organization status');
    }

    console.log(`[provision-subdomain] Successfully provisioned ${hostname} via wildcard DNS`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        hostname,
        message: 'Subdomain activated via wildcard DNS. SSL is handled automatically.',
        method: 'wildcard_dns'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[provision-subdomain] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
