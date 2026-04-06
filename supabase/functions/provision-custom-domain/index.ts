import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const VERCEL_PROJECT_ID = 'prj_msg89nRRRnse2bUAmgSj25bd8DbI';
const VERCEL_TEAM_ID = 'team_OYPrLfazBHIHKIu5wpkX8Ytt';

interface ProvisionRequest {
  organization_id: string;
  domain: string; // e.g. "myrentals.com" — no protocol, no www
}

async function addDomainToVercel(domain: string, token: string): Promise<{ success: boolean; error?: string; alreadyExists?: boolean }> {
  const url = `https://api.vercel.com/v10/projects/${VERCEL_PROJECT_ID}/domains?teamId=${VERCEL_TEAM_ID}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: domain }),
  });

  const data = await res.json();

  if (res.ok) {
    return { success: true };
  }

  // Domain already added to this project — that's fine
  if (data?.error?.code === 'domain_already_in_use' || data?.error?.code === 'domain_configuration_exists') {
    return { success: true, alreadyExists: true };
  }

  console.error(`[provision-custom-domain] Vercel API error for ${domain}:`, data);
  return { success: false, error: data?.error?.message || 'Unknown Vercel API error' };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const VERCEL_TOKEN = Deno.env.get('VERCEL_TOKEN');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase credentials not configured');
    }

    if (!VERCEL_TOKEN) {
      throw new Error('VERCEL_TOKEN secret not configured');
    }

    const { organization_id, domain }: ProvisionRequest = await req.json();

    if (!organization_id || !domain) {
      return new Response(
        JSON.stringify({ error: 'organization_id and domain are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize domain input
    const cleanDomain = domain
      .replace(/^https?:\/\//, '')
      .replace(/\/.*$/, '')
      .replace(/^www\./, '')
      .trim()
      .toLowerCase();

    console.log(`[provision-custom-domain] Adding ${cleanDomain} and www.${cleanDomain} to Vercel`);

    // Add both apex and www to Vercel project
    const [apexResult, wwwResult] = await Promise.all([
      addDomainToVercel(cleanDomain, VERCEL_TOKEN),
      addDomainToVercel(`www.${cleanDomain}`, VERCEL_TOKEN),
    ]);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    if (!apexResult.success) {
      // Update org with error
      await supabase
        .from('organizations')
        .update({ domain_verification_status: 'error' })
        .eq('id', organization_id);

      return new Response(
        JSON.stringify({ error: `Failed to register domain with hosting: ${apexResult.error}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mark domain as pending verification in org record
    await supabase
      .from('organizations')
      .update({ domain_verification_status: 'pending' })
      .eq('id', organization_id);

    console.log(`[provision-custom-domain] Successfully registered ${cleanDomain} with Vercel`);

    return new Response(
      JSON.stringify({
        success: true,
        domain: cleanDomain,
        www: `www.${cleanDomain}`,
        alreadyExisted: apexResult.alreadyExists,
        message: 'Domain registered with hosting. Add DNS records and verify to go live.',
        // These are the exact DNS records the tenant needs to add
        dns_records: [
          { type: 'A',     host: '@',               value: '76.76.21.21' },
          { type: 'CNAME', host: 'www',             value: 'cname.vercel-dns.com' },
          { type: 'CNAME', host: '_acme-challenge', value: `_acme-challenge.${cleanDomain}.cname.vercel-dns.com` },
          { type: 'TXT',   host: '_staymoxie',      value: `staymoxie_verify=${organization_id}` },
        ],
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[provision-custom-domain] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
