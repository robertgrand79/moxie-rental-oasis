import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PriceLabsListing {
  listing_id: string;
  prices: {
    [date: string]: {
      price: number;
      min_stay?: number;
      available?: boolean;
    };
  };
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const priceLabsApiKey = Deno.env.get('PRICELABS_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!priceLabsApiKey) {
      throw new Error('PRICELABS_API_KEY not configured');
    }

    console.log('Starting PriceLabs sync...');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get request body for optional parameters
    const body = await req.json().catch(() => ({}));
    const { property_id, start_date, end_date } = body;

    // Fetch properties from database with PriceLabs listing IDs
    let query = supabase.from('properties').select('id, title, pricelabs_listing_id');
    
    if (property_id) {
      query = query.eq('id', property_id);
    } else {
      // Only fetch properties that have a PriceLabs listing ID configured
      query = query.not('pricelabs_listing_id', 'is', null);
    }

    const { data: properties, error: propertiesError } = await query;

    if (propertiesError) {
      console.error('Error fetching properties:', propertiesError);
      throw propertiesError;
    }

    if (!properties || properties.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'No properties found with PriceLabs listing IDs configured',
          message: 'Please configure PriceLabs listing IDs for your properties in the admin settings'
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Syncing pricing for ${properties.length} properties`);

    let totalPricesUpdated = 0;
    const syncResults = [];

    // Fetch pricing from PriceLabs for each property
    for (const property of properties) {
      try {
        console.log(`Fetching pricing for property: ${property.title} (${property.id})`);

        // Skip if no PriceLabs listing ID configured
        if (!property.pricelabs_listing_id) {
          console.log(`Skipping ${property.title}: No PriceLabs listing ID configured`);
          syncResults.push({
            property_id: property.id,
            property_title: property.title,
            success: false,
            error: 'No PriceLabs listing ID configured'
          });
          continue;
        }

        // Build PriceLabs API URL using the configured listing ID
        const priceLabsUrl = new URL('https://api.pricelabs.co/v1/listings/prices');
        priceLabsUrl.searchParams.append('listing_id', property.pricelabs_listing_id);
        
        if (start_date) {
          priceLabsUrl.searchParams.append('start_date', start_date);
        } else {
          // Default to today
          priceLabsUrl.searchParams.append('start_date', new Date().toISOString().split('T')[0]);
        }
        
        if (end_date) {
          priceLabsUrl.searchParams.append('end_date', end_date);
        } else {
          // Default to 365 days from now
          const oneYearFromNow = new Date();
          oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
          priceLabsUrl.searchParams.append('end_date', oneYearFromNow.toISOString().split('T')[0]);
        }

        // Call PriceLabs API
        const priceLabsResponse = await fetch(priceLabsUrl.toString(), {
          method: 'GET',
          headers: {
            'X-API-Key': priceLabsApiKey,
            'Content-Type': 'application/json',
          },
        });

        if (!priceLabsResponse.ok) {
          const errorText = await priceLabsResponse.text();
          console.error(`PriceLabs API error for ${property.title}:`, priceLabsResponse.status, errorText);
          
          syncResults.push({
            property_id: property.id,
            property_title: property.title,
            success: false,
            error: `PriceLabs API returned ${priceLabsResponse.status}`,
          });
          continue;
        }

        const priceLabsData = await priceLabsResponse.json();
        console.log(`Received pricing data for ${property.title}:`, Object.keys(priceLabsData.prices || {}).length, 'dates');

        // Upsert pricing data into dynamic_pricing table
        const pricingRecords = [];
        
        if (priceLabsData.prices) {
          for (const [date, priceData] of Object.entries(priceLabsData.prices)) {
            pricingRecords.push({
              property_id: property.id,
              date: date,
              base_price: priceData.price || 0,
              pricelabs_price: priceData.price || 0,
              final_price: priceData.price || 0,
              pricing_source: 'pricelabs',
              market_demand: priceData.available === false ? 'blocked' : undefined,
            });
          }
        }

        if (pricingRecords.length > 0) {
          // Upsert pricing records
          const { error: upsertError } = await supabase
            .from('dynamic_pricing')
            .upsert(pricingRecords, {
              onConflict: 'property_id,date',
            });

          if (upsertError) {
            console.error(`Error upserting pricing for ${property.title}:`, upsertError);
            syncResults.push({
              property_id: property.id,
              property_title: property.title,
              success: false,
              error: upsertError.message,
            });
          } else {
            console.log(`Successfully synced ${pricingRecords.length} prices for ${property.title}`);
            totalPricesUpdated += pricingRecords.length;
            syncResults.push({
              property_id: property.id,
              property_title: property.title,
              success: true,
              prices_synced: pricingRecords.length,
            });
          }
        } else {
          syncResults.push({
            property_id: property.id,
            property_title: property.title,
            success: true,
            prices_synced: 0,
            message: 'No pricing data available',
          });
        }
      } catch (propertyError) {
        console.error(`Error processing property ${property.title}:`, propertyError);
        syncResults.push({
          property_id: property.id,
          property_title: property.title,
          success: false,
          error: propertyError.message,
        });
      }
    }

    console.log(`PriceLabs sync complete. Total prices updated: ${totalPricesUpdated}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Synced pricing for ${properties.length} properties`,
        total_prices_updated: totalPricesUpdated,
        results: syncResults,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in PriceLabs sync:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Check edge function logs for more information'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
