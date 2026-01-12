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
    const CLOUDFLARE_API_TOKEN = Deno.env.get('CLOUDFLARE_API_TOKEN');
    const CLOUDFLARE_ZONE_ID = Deno.env.get('CLOUDFLARE_ZONE_ID');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ZONE_ID) {
      throw new Error('Cloudflare credentials not configured');
    }

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

    // Update status to provisioning
    await supabase
      .from('organizations')
      .update({ 
        subdomain_status: 'provisioning',
        subdomain_error: null 
      })
      .eq('id', organization_id);

    const hostname = `${slug}.staymoxie.com`;

    console.log(`Provisioning custom hostname: ${hostname}`);

    // Create custom hostname via Cloudflare API
    const cfResponse = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/custom_hostnames`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hostname: hostname,
          ssl: {
            method: 'http',
            type: 'dv',
            settings: {
              min_tls_version: '1.2',
              http2: 'on',
            },
          },
          custom_metadata: {
            organization_id: organization_id,
          },
        }),
      }
    );

    const cfResult = await cfResponse.json();

    if (!cfResponse.ok || !cfResult.success) {
      const errorMessage = cfResult.errors?.[0]?.message || 'Failed to provision subdomain';
      console.error('Cloudflare API error:', cfResult);

      // Check if hostname already exists (code 1414)
      if (cfResult.errors?.[0]?.code === 1414) {
        // Hostname already exists, mark as active
        await supabase
          .from('organizations')
          .update({ 
            subdomain_status: 'active',
            subdomain_error: null 
          })
          .eq('id', organization_id);

        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Hostname already exists and is active',
            hostname 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Update with error
      await supabase
        .from('organizations')
        .update({ 
          subdomain_status: 'failed',
          subdomain_error: errorMessage 
        })
        .eq('id', organization_id);

      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Success - SSL will be provisioned asynchronously by Cloudflare
    const customHostname = cfResult.result;
    console.log('Custom hostname created:', customHostname);

    // Update status based on SSL status
    const sslStatus = customHostname.ssl?.status;
    const subdomainStatus = sslStatus === 'active' ? 'active' : 'provisioning';

    await supabase
      .from('organizations')
      .update({ 
        subdomain_status: subdomainStatus,
        subdomain_error: null,
        cloudflare_hostname_id: customHostname.id 
      })
      .eq('id', organization_id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        hostname,
        ssl_status: sslStatus,
        cloudflare_hostname_id: customHostname.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error provisioning subdomain:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
