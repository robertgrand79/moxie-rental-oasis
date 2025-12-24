import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_IP = '185.158.133.1';

interface DnsAnswer {
  type: number;
  data: string;
  name?: string;
}

interface DnsResponse {
  Answer?: DnsAnswer[];
  Status?: number;
}

interface DiagnosticResult {
  check: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: string;
}

async function lookupDns(domain: string, recordType: 'A' | 'TXT'): Promise<DnsAnswer[]> {
  const typeCode = recordType === 'A' ? 'A' : 'TXT';
  const response = await fetch(
    `https://dns.google/resolve?name=${domain}&type=${typeCode}`,
    { headers: { 'Accept': 'application/dns-json' } }
  );
  
  if (!response.ok) {
    throw new Error(`DNS lookup failed: ${response.status}`);
  }
  
  const data: DnsResponse = await response.json();
  
  // Filter by record type (1 = A, 16 = TXT)
  const typeNum = recordType === 'A' ? 1 : 16;
  return data.Answer?.filter((record) => record.type === typeNum) || [];
}

async function checkDomain(domain: string, orgId: string): Promise<{
  verified: boolean;
  diagnostics: DiagnosticResult[];
  ipAddresses: string[];
  txtRecords: string[];
  message: string;
}> {
  const diagnostics: DiagnosticResult[] = [];
  let ipAddresses: string[] = [];
  let txtRecords: string[] = [];
  
  // Clean the domain
  const cleanDomain = domain.replace(/^www\./, '').trim().toLowerCase();
  
  console.log(`[verify-domain-dns] Running diagnostics for: ${cleanDomain}`);
  
  // Check 1: Root domain A record
  try {
    const rootARecords = await lookupDns(cleanDomain, 'A');
    ipAddresses = rootARecords.map(r => r.data);
    
    if (ipAddresses.length === 0) {
      diagnostics.push({
        check: 'Root Domain A Record',
        status: 'fail',
        message: 'No A record found for root domain',
        details: `Add an A record for @ pointing to ${LOVABLE_IP}`
      });
    } else if (ipAddresses.includes(LOVABLE_IP)) {
      diagnostics.push({
        check: 'Root Domain A Record',
        status: 'pass',
        message: `Root domain correctly points to ${LOVABLE_IP}`
      });
    } else {
      diagnostics.push({
        check: 'Root Domain A Record',
        status: 'fail',
        message: `Root domain points to ${ipAddresses.join(', ')} instead of ${LOVABLE_IP}`,
        details: 'Update your A record to point to the correct IP address'
      });
    }
  } catch (error) {
    console.error('[verify-domain-dns] Root A record lookup error:', error);
    diagnostics.push({
      check: 'Root Domain A Record',
      status: 'fail',
      message: 'Could not lookup root domain A record',
      details: 'DNS lookup failed - check if the domain exists'
    });
  }
  
  // Check 2: WWW subdomain A record
  try {
    const wwwARecords = await lookupDns(`www.${cleanDomain}`, 'A');
    const wwwIps = wwwARecords.map(r => r.data);
    
    if (wwwIps.length === 0) {
      diagnostics.push({
        check: 'WWW Subdomain A Record',
        status: 'warning',
        message: 'No A record found for www subdomain',
        details: `Add an A record for www pointing to ${LOVABLE_IP} if you want www.${cleanDomain} to work`
      });
    } else if (wwwIps.includes(LOVABLE_IP)) {
      diagnostics.push({
        check: 'WWW Subdomain A Record',
        status: 'pass',
        message: `www subdomain correctly points to ${LOVABLE_IP}`
      });
    } else {
      diagnostics.push({
        check: 'WWW Subdomain A Record',
        status: 'warning',
        message: `www subdomain points to ${wwwIps.join(', ')} instead of ${LOVABLE_IP}`,
        details: 'Update the www A record to point to the correct IP for www to work'
      });
    }
  } catch (error) {
    console.error('[verify-domain-dns] WWW A record lookup error:', error);
    diagnostics.push({
      check: 'WWW Subdomain A Record',
      status: 'warning',
      message: 'Could not lookup www subdomain',
      details: 'This is optional but recommended for www.yourdomain.com to work'
    });
  }
  
  // Check 3: TXT verification record
  try {
    const txtResults = await lookupDns(`_lovable.${cleanDomain}`, 'TXT');
    txtRecords = txtResults.map(r => r.data.replace(/"/g, ''));
    
    const expectedTxt = `lovable_verify=${orgId}`;
    const hasTxtRecord = txtRecords.some(txt => txt.includes(expectedTxt) || txt.includes(orgId));
    
    if (hasTxtRecord) {
      diagnostics.push({
        check: 'TXT Verification Record',
        status: 'pass',
        message: 'Domain ownership verified via TXT record'
      });
    } else if (txtRecords.length > 0) {
      diagnostics.push({
        check: 'TXT Verification Record',
        status: 'warning',
        message: 'TXT record found but value does not match',
        details: `Expected: ${expectedTxt}. Found: ${txtRecords.join(', ')}`
      });
    } else {
      diagnostics.push({
        check: 'TXT Verification Record',
        status: 'warning',
        message: 'No TXT verification record found',
        details: `Add a TXT record for _lovable with value: ${expectedTxt}`
      });
    }
  } catch (error) {
    console.error('[verify-domain-dns] TXT record lookup error:', error);
    diagnostics.push({
      check: 'TXT Verification Record',
      status: 'warning',
      message: 'Could not lookup TXT verification record',
      details: 'TXT verification is optional but recommended'
    });
  }
  
  // Determine overall verification status
  const rootARecordPassed = diagnostics.find(d => d.check === 'Root Domain A Record')?.status === 'pass';
  const verified = rootARecordPassed;
  
  // Generate summary message
  let message: string;
  if (verified) {
    const hasWarnings = diagnostics.some(d => d.status === 'warning');
    message = hasWarnings 
      ? 'DNS is configured correctly, but there are optional improvements available.'
      : 'DNS is fully configured! Your domain is ready.';
  } else {
    const failedChecks = diagnostics.filter(d => d.status === 'fail').map(d => d.check);
    message = `DNS configuration incomplete. Issues: ${failedChecks.join(', ')}`;
  }
  
  return {
    verified,
    diagnostics,
    ipAddresses,
    txtRecords,
    message
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { domain, organization_id } = await req.json();

    if (!domain) {
      return new Response(
        JSON.stringify({ verified: false, message: 'Domain is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[verify-domain-dns] Checking DNS for domain: ${domain}, org: ${organization_id}`);

    // Run full diagnostics
    const result = await checkDomain(domain, organization_id || '');
    
    console.log(`[verify-domain-dns] Result: verified=${result.verified}, message=${result.message}`);

    // Update organization verification status if org_id provided
    if (organization_id) {
      try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        await supabase.rpc('update_domain_verification_status', {
          _org_id: organization_id,
          _status: result.verified ? 'verified' : 'pending',
          _dns_records: {
            ip_addresses: result.ipAddresses,
            txt_records: result.txtRecords,
            diagnostics: result.diagnostics,
            checked_at: new Date().toISOString()
          }
        });
        console.log(`[verify-domain-dns] Updated org ${organization_id} verification status`);
      } catch (updateError) {
        console.error('[verify-domain-dns] Failed to update verification status:', updateError);
      }
    }

    return new Response(
      JSON.stringify({
        verified: result.verified,
        message: result.message,
        diagnostics: result.diagnostics,
        ip_addresses: result.ipAddresses,
        txt_records: result.txtRecords
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[verify-domain-dns] Error:', error);
    return new Response(
      JSON.stringify({ 
        verified: false, 
        message: 'An error occurred while verifying DNS. Please try again.',
        diagnostics: [{
          check: 'DNS Lookup',
          status: 'fail',
          message: 'Failed to perform DNS verification',
          details: error instanceof Error ? error.message : 'Unknown error'
        }]
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
