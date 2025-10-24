const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const priceLabsApiKey = Deno.env.get('PRICELABS_API_KEY');

    if (!priceLabsApiKey) {
      throw new Error('PRICELABS_API_KEY not configured');
    }

    console.log('Fetching PriceLabs listings...');

    // Call PriceLabs API to get all listings
    const priceLabsUrl = 'https://api.pricelabs.co/v1/listings';
    
    const response = await fetch(priceLabsUrl, {
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
      JSON.stringify({
        success: true,
        listings: data.listings || [],
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error fetching PriceLabs listings:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        listings: []
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
