import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_IP = '185.158.133.1';

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { domain } = await req.json();

    if (!domain) {
      return new Response(
        JSON.stringify({ verified: false, message: 'Domain is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[verify-domain-dns] Checking DNS for domain: ${domain}`);

    // Clean the domain
    const cleanDomain = domain.replace(/^www\./, '').trim().toLowerCase();
    
    // Use DNS over HTTPS to check A records
    const dnsResponse = await fetch(
      `https://dns.google/resolve?name=${cleanDomain}&type=A`,
      { headers: { 'Accept': 'application/dns-json' } }
    );

    if (!dnsResponse.ok) {
      console.log(`[verify-domain-dns] DNS lookup failed for ${cleanDomain}`);
      return new Response(
        JSON.stringify({ 
          verified: false, 
          message: 'Could not perform DNS lookup. Please try again later.' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const dnsData = await dnsResponse.json();
    console.log(`[verify-domain-dns] DNS response:`, JSON.stringify(dnsData));

    // Check if we got A records
    const aRecords = dnsData.Answer?.filter((record: any) => record.type === 1) || [];
    const ipAddresses = aRecords.map((record: any) => record.data);

    console.log(`[verify-domain-dns] Found A records:`, ipAddresses);

    // Check if Lovable's IP is in the A records
    const hasCorrectIP = ipAddresses.includes(LOVABLE_IP);

    if (hasCorrectIP) {
      console.log(`[verify-domain-dns] ✓ Domain ${cleanDomain} is correctly pointing to ${LOVABLE_IP}`);
      return new Response(
        JSON.stringify({ 
          verified: true, 
          message: 'DNS is correctly configured! Your domain is pointing to Lovable.',
          ip_addresses: ipAddresses
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if there are any A records at all
    if (ipAddresses.length > 0) {
      console.log(`[verify-domain-dns] ✗ Domain ${cleanDomain} points to ${ipAddresses.join(', ')} instead of ${LOVABLE_IP}`);
      return new Response(
        JSON.stringify({ 
          verified: false, 
          message: `Your domain is pointing to ${ipAddresses.join(', ')} instead of ${LOVABLE_IP}. Please update your A record.`,
          ip_addresses: ipAddresses
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // No A records found
    console.log(`[verify-domain-dns] ✗ No A records found for ${cleanDomain}`);
    return new Response(
      JSON.stringify({ 
        verified: false, 
        message: 'No A records found for this domain. Please add an A record pointing to ' + LOVABLE_IP,
        ip_addresses: []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[verify-domain-dns] Error:', error);
    return new Response(
      JSON.stringify({ 
        verified: false, 
        message: 'An error occurred while verifying DNS. Please try again.' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
