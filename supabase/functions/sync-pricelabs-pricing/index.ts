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

// Helper to determine if a date is a weekend (Fri/Sat nights are premium)
function isWeekendNight(date: Date): boolean {
  const day = date.getDay();
  return day === 5 || day === 6; // Friday or Saturday
}

// Helper to apply weekend/weekday pricing variation
function calculateVariedPrice(basePrice: number, minPrice: number, maxPrice: number | null, date: Date): number {
  const effectiveMax = maxPrice || basePrice * 1.5;
  const priceRange = effectiveMax - minPrice;
  
  if (isWeekendNight(date)) {
    // Weekend: 70-100% of range above min
    return Math.round(minPrice + priceRange * 0.85);
  } else {
    // Weekday: 20-50% of range above min
    return Math.round(minPrice + priceRange * 0.35);
  }
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

    console.log('Starting PriceLabs sync with weekend/weekday price variation...');

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

    // Fetch all listings from PriceLabs (for basic info, min/max, and fallback prices)
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

    // Log available listings with min/max for debugging
    console.log('=== Available PriceLabs Listings ===');
    priceLabsListings.forEach(l => {
      console.log(`  ID: ${l.id} | Name: ${l.name} | Base: $${l.base} | Min: $${l.min} | Max: $${l.max || 'N/A'} | Recommended: $${l.recommended_base_price}`);
    });
    console.log('====================================');

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
        
        // Warn if property mapping doesn't match any PriceLabs listing
        if (!listing) {
          console.warn(`⚠️ WARNING: Property "${property.title}" mapped to ID "${property.pricelabs_listing_id}" but NO matching PriceLabs listing found!`);
          console.warn(`   Available IDs: ${priceLabsListings.map(l => l.id).join(', ')}`);
        } else {
          console.log(`✓ Matched: "${property.title}" -> PriceLabs "${listing.name}" (ID: ${listing.id})`);
          console.log(`  Price range: $${listing.min} - $${listing.max || 'N/A'}, Recommended: $${listing.recommended_base_price}`);
        }

        // Get min/max price limits from listing
        const minPriceLimit = listing?.min || 0;
        const maxPriceLimit = listing?.max || null;

        // Validate fallback price is a valid number
        let basePrice = listing?.recommended_base_price || listing?.base || property.price_per_night;
        if (typeof basePrice !== 'number' || isNaN(basePrice) || basePrice <= 0) {
          basePrice = property.price_per_night;
        }
        if (typeof basePrice !== 'number' || isNaN(basePrice) || basePrice <= 0) {
          basePrice = 100; // Ultimate fallback
          console.warn(`⚠️ Using default fallback price ($100) for ${property.title}`);
        }

        console.log(`Fetching dynamic pricing for ${property.title} (${property.pricelabs_listing_id}), base: $${basePrice}...`);

        // Get daily prices from listing_prices endpoint (recommended by PriceLabs support)
        const listingPricesUrl = `https://api.pricelabs.co/v1/listing_prices?listing_id=${property.pricelabs_listing_id}`;
        console.log(`Calling: ${listingPricesUrl}`);
        
        const response = await fetch(listingPricesUrl, {
          method: 'GET',
          headers: {
            'X-API-Key': priceLabsApiKey,
            'Content-Type': 'application/json',
          },
        });

        // Store parsed pricing data from API
        const dailyPricesFromApi: Map<string, CustomPricingDay> = new Map();
        let currency = 'USD';
        let lastUpdated: string | null = null;
        let pricesFromApi = 0;
        let hasPartnerApiAccess = false;

        if (response.ok) {
          const responseData: CustomPricingResponse = await response.json();
          console.log(`Response from custom-pricing:`, JSON.stringify(responseData).substring(0, 2000));

          // Extract metadata
          currency = responseData.currency || 'USD';
          lastUpdated = responseData.last_updated || null;

          // Parse pricing data - handle various response formats
          let pricesArray: CustomPricingDay[] = [];
          
          if (Array.isArray(responseData)) {
            pricesArray = responseData;
          } else if (responseData.prices && Array.isArray(responseData.prices)) {
            pricesArray = responseData.prices;
          } else if (responseData.data && Array.isArray(responseData.data)) {
            pricesArray = responseData.data;
          } else if (typeof responseData === 'object') {
            const keys = Object.keys(responseData);
            for (const dateKey of keys) {
              if (dateKey.match(/^\d{4}-\d{2}-\d{2}$/)) {
                const value = responseData[dateKey];
                if (typeof value === 'number') {
                  pricesArray.push({ date: dateKey, price: value });
                } else if (value && typeof value === 'object') {
                  pricesArray.push({
                    date: dateKey,
                    price: value.price || value.rate || basePrice,
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
              dailyPricesFromApi.set(item.date, {
                date: item.date,
                price: item.price || item.rate || basePrice,
                min_stay: item.min_stay || item.minStay || item.minimum_stay,
                checkin: item.checkin !== false && item.check_in !== false,
                checkout: item.checkout !== false && item.check_out !== false,
                is_override: item.is_override || false,
              });
            }
          }

          pricesFromApi = dailyPricesFromApi.size;
          hasPartnerApiAccess = pricesFromApi > 0;
          console.log(`Got ${pricesFromApi} daily prices from listing_prices endpoint`);
        } else {
          console.log(`listing_prices endpoint returned ${response.status}`);
        }

        // Build pricing records for the next 365 days
        const pricingRecords = [];
        let pricesFromVariation = 0;

        const today = new Date();
        for (let i = 0; i < 365; i++) {
          const date = new Date(today);
          date.setDate(date.getDate() + i);
          const dateStr = date.toISOString().split('T')[0];
          
          const dayData = dailyPricesFromApi.get(dateStr);
          
          let finalPrice: number;
          let priceLabsPrice: number | null = null;
          let minStay: number | null = null;
          let checkinAllowed = true;
          let checkoutAllowed = true;

          if (dayData) {
            // Use actual daily price from Partner API
            finalPrice = dayData.price;
            priceLabsPrice = dayData.price;
            minStay = dayData.min_stay || null;
            checkinAllowed = dayData.checkin !== false;
            checkoutAllowed = dayData.checkout !== false;
          } else if (listing && minPriceLimit > 0) {
            // Apply weekend/weekday variation using min/max from listings
            finalPrice = calculateVariedPrice(basePrice, minPriceLimit, maxPriceLimit, date);
            priceLabsPrice = finalPrice; // Mark as PriceLabs-derived (from min/max)
            pricesFromVariation++;
          } else {
            // Ultimate fallback - just use base price
            finalPrice = basePrice;
          }
          
          pricingRecords.push({
            property_id: property.id,
            date: dateStr,
            base_price: basePrice,
            pricelabs_price: priceLabsPrice,
            final_price: finalPrice,
            pricing_source: hasPartnerApiAccess ? 'pricelabs_daily' : (listing ? 'pricelabs_variation' : 'fallback'),
            min_stay: minStay,
            checkin_allowed: checkinAllowed,
            checkout_allowed: checkoutAllowed,
            currency: currency,
            last_synced_at: syncTimestamp,
            min_price_limit: minPriceLimit > 0 ? minPriceLimit : null,
            max_price_limit: maxPriceLimit,
          });
        }

        console.log(`${property.title}: ${pricesFromApi} from Partner API, ${pricesFromVariation} with weekend/weekday variation, min: $${minPriceLimit}, max: $${maxPriceLimit || 'N/A'}`);

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
            prices_with_variation: pricesFromVariation,
            has_partner_api_access: hasPartnerApiAccess,
            min_price_limit: minPriceLimit,
            max_price_limit: maxPriceLimit,
            base_price_used: basePrice,
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