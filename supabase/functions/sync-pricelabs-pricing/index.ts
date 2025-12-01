import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PriceLabsListing {
  id: string;
  name: string;
  base: number;
  min: number;
  max: number | null;
  recommended_base_price: number;
}

interface DailyPrice {
  date: string;
  price: number;
  min_stay?: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json().catch(() => ({}));
    const { property_id, organization_id } = body;

    console.log('Starting PriceLabs sync with daily calendar prices...');

    // Determine API key to use
    let priceLabsApiKey: string | null = null;
    let effectiveOrgId = organization_id;

    if (property_id && !organization_id) {
      const { data: property } = await supabase
        .from('properties')
        .select('organization_id')
        .eq('id', property_id)
        .single();
      effectiveOrgId = property?.organization_id;
    }

    if (effectiveOrgId) {
      const { data: org } = await supabase
        .from('organizations')
        .select('pricelabs_api_key')
        .eq('id', effectiveOrgId)
        .single();
      priceLabsApiKey = org?.pricelabs_api_key;
    }

    if (!priceLabsApiKey) {
      priceLabsApiKey = Deno.env.get('PRICELABS_API_KEY');
    }

    if (!priceLabsApiKey) {
      throw new Error('PRICELABS_API_KEY not configured');
    }

    // Fetch all listings from PriceLabs (for basic info and listing ID mapping)
    console.log('Fetching PriceLabs listings...');
    const listingsResponse = await fetch('https://api.pricelabs.co/v1/listings', {
      method: 'GET',
      headers: {
        'X-API-Key': priceLabsApiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!listingsResponse.ok) {
      throw new Error(`PriceLabs listings API error: ${listingsResponse.status}`);
    }

    const listingsData = await listingsResponse.json();
    console.log('Full listings API response structure:', JSON.stringify(listingsData).substring(0, 2000));
    const priceLabsListings: PriceLabsListing[] = listingsData.listings || [];
    console.log(`Fetched ${priceLabsListings.length} PriceLabs listings`);
    
    // Log first listing's full structure to see what data is available
    if (priceLabsListings.length > 0) {
      console.log('First listing full structure:', JSON.stringify(priceLabsListings[0]));
    }

    // Create a map for quick lookup
    const listingMap = new Map<string, PriceLabsListing>();
    priceLabsListings.forEach(l => listingMap.set(l.id, l));

    // Fetch properties from database
    let query = supabase.from('properties').select('id, title, pricelabs_listing_id, price_per_night');
    
    if (property_id) {
      query = query.eq('id', property_id);
    } else {
      query = query.not('pricelabs_listing_id', 'is', null);
    }

    const { data: properties, error: propertiesError } = await query;

    if (propertiesError) throw propertiesError;

    if (!properties || properties.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'No properties with PriceLabs mapping found',
          results: []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Syncing daily pricing for ${properties.length} properties`);

    let totalPricesUpdated = 0;
    const syncResults = [];

    for (const property of properties) {
      try {
        if (!property.pricelabs_listing_id) {
          syncResults.push({
            property_id: property.id,
            property_title: property.title,
            success: false,
            error: 'No PriceLabs listing ID configured'
          });
          continue;
        }

        const listing = listingMap.get(property.pricelabs_listing_id);
        const fallbackPrice = listing?.recommended_base_price || listing?.base || property.price_per_night || 100;

        console.log(`Fetching daily prices for ${property.title} (${property.pricelabs_listing_id})...`);

        // Fetch daily pricing from /v1/getpricing endpoint (POST request)
        const dailyPrices: Record<string, number> = {};
        const minStays: Record<string, number> = {};
        let pricesFromApi = 0;

        const pricingResponse = await fetch(
          `https://api.pricelabs.co/v1/getpricing`,
          {
            method: 'POST',
            headers: {
              'X-API-Key': priceLabsApiKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              listing_ids: [property.pricelabs_listing_id]
            }),
          }
        );

        if (pricingResponse.ok) {
          const pricingData = await pricingResponse.json();
          console.log(`getpricing response for ${property.title}:`, JSON.stringify(pricingData).substring(0, 1000));

          // Parse pricing data - the response format is { listings: [{ id, prices: [{date, price, min_stay}] }] }
          if (pricingData.listings && Array.isArray(pricingData.listings)) {
            for (const listing of pricingData.listings) {
              if (listing.id === property.pricelabs_listing_id && listing.prices) {
                for (const priceEntry of listing.prices) {
                  if (priceEntry.date && priceEntry.price) {
                    dailyPrices[priceEntry.date] = priceEntry.price;
                    if (priceEntry.min_stay) {
                      minStays[priceEntry.date] = priceEntry.min_stay;
                    }
                  }
                }
              }
            }
          } else if (pricingData.prices && Array.isArray(pricingData.prices)) {
            // Alternative format: { prices: [{date, price, min_stay}] }
            for (const item of pricingData.prices) {
              if (item.date && item.price) {
                dailyPrices[item.date] = item.price;
                if (item.min_stay) {
                  minStays[item.date] = item.min_stay;
                }
              }
            }
          } else if (Array.isArray(pricingData)) {
            // Format: [{date, price, min_stay}, ...]
            for (const item of pricingData) {
              if (item.date && item.price) {
                dailyPrices[item.date] = item.price;
                if (item.min_stay) {
                  minStays[item.date] = item.min_stay;
                }
              }
            }
          }
          pricesFromApi = Object.keys(dailyPrices).length;
          console.log(`Got ${pricesFromApi} daily prices from getpricing endpoint`);
        } else {
          const errorText = await pricingResponse.text();
          console.log(`getpricing endpoint returned ${pricingResponse.status}: ${errorText}`);
        }

        // Build pricing records for the next 365 days
        const pricingRecords = [];
        let pricesFromFallback = 0;

        const today = new Date();
        for (let i = 0; i < 365; i++) {
          const date = new Date(today);
          date.setDate(date.getDate() + i);
          const dateStr = date.toISOString().split('T')[0];
          
          // Use daily price if available, otherwise use fallback
          let finalPrice: number;
          if (dailyPrices[dateStr]) {
            finalPrice = dailyPrices[dateStr];
          } else {
            finalPrice = fallbackPrice;
            pricesFromFallback++;
          }
          
          pricingRecords.push({
            property_id: property.id,
            date: dateStr,
            base_price: fallbackPrice,
            pricelabs_price: finalPrice,
            final_price: finalPrice,
            pricing_source: 'pricelabs',
          });
        }

        console.log(`${property.title}: ${pricesFromApi} from API, ${pricesFromFallback} from fallback ($${fallbackPrice})`);

        // Log sample prices for Dec 18-21 verification
        const sampleDates = ['2025-12-18', '2025-12-19', '2025-12-20', '2025-12-21'];
        for (const sampleDate of sampleDates) {
          const record = pricingRecords.find(r => r.date === sampleDate);
          if (record) {
            console.log(`  ${sampleDate}: $${record.final_price}`);
          }
        }

        // Upsert in batches
        const batchSize = 100;
        let errorOccurred = false;
        
        for (let i = 0; i < pricingRecords.length; i += batchSize) {
          const batch = pricingRecords.slice(i, i + batchSize);
          const { error: upsertError } = await supabase
            .from('dynamic_pricing')
            .upsert(batch, { onConflict: 'property_id,date' });

          if (upsertError) {
            console.error(`Error upserting prices for ${property.title}:`, upsertError);
            errorOccurred = true;
            break;
          }
        }

        if (errorOccurred) {
          syncResults.push({
            property_id: property.id,
            property_title: property.title,
            success: false,
            error: 'Error upserting pricing records'
          });
        } else {
          console.log(`Synced ${pricingRecords.length} prices for ${property.title}`);
          totalPricesUpdated += pricingRecords.length;
          syncResults.push({
            property_id: property.id,
            property_title: property.title,
            success: true,
            prices_synced: pricingRecords.length,
            prices_from_api: pricesFromApi,
            prices_from_fallback: pricesFromFallback,
            base_price_used: fallbackPrice
          });
        }
      } catch (propertyError) {
        console.error(`Error processing ${property.title}:`, propertyError);
        syncResults.push({
          property_id: property.id,
          property_title: property.title,
          success: false,
          error: propertyError.message
        });
      }
    }

    console.log(`PriceLabs sync complete. Total prices updated: ${totalPricesUpdated}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Synced daily pricing for ${properties.length} properties`,
        total_prices_updated: totalPricesUpdated,
        results: syncResults,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('PriceLabs sync error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
