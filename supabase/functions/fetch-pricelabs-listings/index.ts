import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { organization_id } = await req.json().catch(() => ({}));
    
    let priceLabsApiKey: string | null = null;

    // Try org-level API key first
    if (organization_id) {
      console.log(`Fetching PriceLabs API key for organization: ${organization_id}`);
      const { data: org } = await supabase
        .from('organizations')
        .select('pricelabs_api_key')
        .eq('id', organization_id)
        .single();
      
      priceLabsApiKey = org?.pricelabs_api_key;
    }

    // Fall back to global secret
    if (!priceLabsApiKey) {
      priceLabsApiKey = Deno.env.get('PRICELABS_API_KEY');
    }

    if (!priceLabsApiKey) {
      throw new Error('PRICELABS_API_KEY not configured');
    }

    console.log('Fetching PriceLabs listings...');

    const response = await fetch('https://api.pricelabs.co/v1/listings', {
      method: 'GET',
      headers: {
        'X-API-Key': priceLabsApiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('PriceLabs API error:', response.status, errorText);
      throw new Error(`PriceLabs API returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log(`Fetched ${data.listings?.length || 0} PriceLabs listings`);

    return new Response(
      JSON.stringify({ success: true, listings: data.listings || [] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching PriceLabs listings:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message, listings: [] }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
