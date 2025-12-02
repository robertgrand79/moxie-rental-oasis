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

interface CustomPricingDay {
  date: string;
  price: number;
  min_stay?: number;
  checkin?: boolean;
  checkout?: boolean;
  is_override?: boolean;
}

interface CustomPricingResponse {
  listing_id?: string;
  currency?: string;
  last_updated?: string;
  prices?: CustomPricingDay[];
  data?: CustomPricingDay[];
  [key: string]: any;
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

    console.log('Starting PriceLabs sync using GET /v1/custom-pricing/?listing_id= endpoint...');

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

    // Fetch all listings from PriceLabs (for basic info and fallback prices)
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
    const priceLabsListings: PriceLabsListing[] = listingsData.listings || [];
    console.log(`Fetched ${priceLabsListings.length} PriceLabs listings`);

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
    const syncTimestamp = new Date().toISOString();

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

        console.log(`Fetching custom pricing for ${property.title} (${property.pricelabs_listing_id})...`);

        // Use the correct Customer API endpoint: GET /v1/custom-pricing/?listing_id=
        const customPricingUrl = `https://api.pricelabs.co/v1/custom-pricing/?listing_id=${property.pricelabs_listing_id}`;
        console.log(`Calling: ${customPricingUrl}`);
        
        const response = await fetch(customPricingUrl, {
          method: 'GET',
          headers: {
            'X-API-Key': priceLabsApiKey,
            'Content-Type': 'application/json',
          },
        });

        // Store parsed pricing data
        const dailyPrices: Map<string, CustomPricingDay> = new Map();
        let currency = 'USD';
        let lastUpdated: string | null = null;
        let pricesFromApi = 0;

        if (response.ok) {
          const responseData: CustomPricingResponse = await response.json();
          console.log(`Response from custom-pricing:`, JSON.stringify(responseData).substring(0, 2000));

          // Extract metadata
          currency = responseData.currency || 'USD';
          lastUpdated = responseData.last_updated || null;

          // Parse pricing data - handle various response formats
          let pricesArray: CustomPricingDay[] = [];
          
          if (Array.isArray(responseData)) {
            // Response is directly an array of prices
            pricesArray = responseData;
          } else if (responseData.prices && Array.isArray(responseData.prices)) {
            pricesArray = responseData.prices;
          } else if (responseData.data && Array.isArray(responseData.data)) {
            pricesArray = responseData.data;
          } else if (typeof responseData === 'object') {
            // Check if it's a date-keyed object like { "2024-01-01": { price: 100 }, ... }
            const keys = Object.keys(responseData);
            for (const dateKey of keys) {
              if (dateKey.match(/^\d{4}-\d{2}-\d{2}$/)) {
                const value = responseData[dateKey];
                if (typeof value === 'number') {
                  pricesArray.push({ date: dateKey, price: value });
                } else if (value && typeof value === 'object') {
                  pricesArray.push({
                    date: dateKey,
                    price: value.price || value.rate || fallbackPrice,
                    min_stay: value.min_stay || value.minStay || value.minimum_stay,
                    checkin: value.checkin !== false && value.check_in !== false && value.checkin_allowed !== false,
                    checkout: value.checkout !== false && value.check_out !== false && value.checkout_allowed !== false,
                    is_override: value.is_override || value.isOverride || false,
                  });
                }
              }
            }
          }

          // Store in map
          for (const item of pricesArray) {
            if (item.date) {
              dailyPrices.set(item.date, {
                date: item.date,
                price: item.price || item.rate || fallbackPrice,
                min_stay: item.min_stay || item.minStay || item.minimum_stay,
                checkin: item.checkin !== false && item.check_in !== false,
                checkout: item.checkout !== false && item.check_out !== false,
                is_override: item.is_override || false,
              });
            }
          }

          pricesFromApi = dailyPrices.size;
          console.log(`Got ${pricesFromApi} daily prices from custom-pricing endpoint`);
        } else {
          console.log(`custom-pricing endpoint returned ${response.status}: ${await response.text()}`);
        }

        // Build pricing records for the next 365 days
        const pricingRecords = [];
        let pricesFromFallback = 0;

        const today = new Date();
        for (let i = 0; i < 365; i++) {
          const date = new Date(today);
          date.setDate(date.getDate() + i);
          const dateStr = date.toISOString().split('T')[0];
          
          const dayData = dailyPrices.get(dateStr);
          
          // Use daily price if available, otherwise use fallback
          let finalPrice: number;
          let minStay: number | null = null;
          let checkinAllowed = true;
          let checkoutAllowed = true;

          if (dayData) {
            finalPrice = dayData.price;
            minStay = dayData.min_stay || null;
            checkinAllowed = dayData.checkin !== false;
            checkoutAllowed = dayData.checkout !== false;
          } else {
            finalPrice = fallbackPrice;
            pricesFromFallback++;
          }
          
          pricingRecords.push({
            property_id: property.id,
            date: dateStr,
            base_price: fallbackPrice,
            pricelabs_price: dayData ? finalPrice : null,
            final_price: finalPrice,
            pricing_source: 'pricelabs',
            min_stay: minStay,
            checkin_allowed: checkinAllowed,
            checkout_allowed: checkoutAllowed,
            currency: currency,
            last_synced_at: syncTimestamp,
          });
        }

        console.log(`${property.title}: ${pricesFromApi} from API, ${pricesFromFallback} from fallback ($${fallbackPrice})`);

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
            base_price_used: fallbackPrice,
            currency: currency,
            last_updated: lastUpdated,
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
        synced_at: syncTimestamp,
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
