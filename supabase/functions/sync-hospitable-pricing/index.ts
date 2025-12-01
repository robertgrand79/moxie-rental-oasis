import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CalendarDay {
  date: string;
  price: number;
  min_stay?: number;
  available?: boolean;
}

async function fetchCalendarData(
  hospitableId: string,
  hospitableApiKey: string,
  startDate: string,
  endDate: string
): Promise<{ data: CalendarDay[] | null; endpoint: string; error?: string }> {
  // Hospitable API v2 - try different endpoint formats
  const endpoints = [
    // Try include parameter approach (common REST pattern)
    `https://public.api.hospitable.com/v2/properties/${hospitableId}?include=calendar&start_date=${startDate}&end_date=${endDate}`,
    // Try nested calendar_days endpoint
    `https://public.api.hospitable.com/v2/properties/${hospitableId}/calendar_days?start_date=${startDate}&end_date=${endDate}`,
    // Try nested calendar endpoint
    `https://public.api.hospitable.com/v2/properties/${hospitableId}/calendar?start_date=${startDate}&end_date=${endDate}`,
  ];

  for (const url of endpoints) {
    console.log(`Trying endpoint: ${url}`);
    
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${hospitableApiKey}`,
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`Success with endpoint: ${url}`);
        console.log(`Full response:`, JSON.stringify(data).substring(0, 1000));
        
        // Handle different response formats
        let calendarData: CalendarDay[] = [];
        if (data.data && Array.isArray(data.data)) {
          // Standard array response: { data: [...] }
          calendarData = data.data;
        } else if (Array.isArray(data)) {
          // Direct array response: [...]
          calendarData = data;
        } else if (data.calendar && Array.isArray(data.calendar)) {
          // Nested calendar: { calendar: [...] }
          calendarData = data.calendar;
        } else if (data.days && Array.isArray(data.days)) {
          // Nested days: { days: [...] }
          calendarData = data.days;
        } else if (data.data && data.data.calendar && Array.isArray(data.data.calendar)) {
          // Property with included calendar: { data: { ..., calendar: [...] } }
          calendarData = data.data.calendar;
        } else if (data.data && data.data.calendar_days && Array.isArray(data.data.calendar_days)) {
          // Property with included calendar_days: { data: { ..., calendar_days: [...] } }
          calendarData = data.data.calendar_days;
        } else if (data.calendar_days && Array.isArray(data.calendar_days)) {
          // Root level calendar_days
          calendarData = data.calendar_days;
        } else if (data.included && Array.isArray(data.included)) {
          // JSON:API style includes
          calendarData = data.included.filter((item: any) => item.type === 'calendar_day' || item.type === 'calendar');
        }
        
        // Log what we found for debugging
        console.log(`Calendar data found: ${calendarData.length} days`);
        if (calendarData.length > 0) {
          console.log(`Sample day:`, JSON.stringify(calendarData[0]));
        }
        
        return { data: calendarData, endpoint: url };
      } else {
        const errorText = await response.text();
        console.log(`Endpoint ${url} returned ${response.status}: ${errorText.substring(0, 200)}`);
      }
    } catch (error) {
      console.log(`Endpoint ${url} failed: ${error.message}`);
    }
  }

  return { data: null, endpoint: '', error: 'All endpoints failed' };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const hospitableApiKey = Deno.env.get('HOSPITABLE_API_KEY');

    if (!hospitableApiKey) {
      console.error('HOSPITABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'HOSPITABLE_API_KEY not configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json().catch(() => ({}));
    const { property_ids, organization_id, test_connection } = body;

    // Handle test connection request
    if (test_connection) {
      console.log('Testing Hospitable API connection...');
      
      try {
        // Test by fetching properties from Hospitable API v2
        const testEndpoints = [
          'https://public.api.hospitable.com/v2/properties',
          'https://api.hospitable.com/v2/properties',
        ];
        
        let successfulEndpoint = null;
        let responseData = null;
        
        for (const url of testEndpoints) {
          console.log(`Testing endpoint: ${url}`);
          const response = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${hospitableApiKey}`,
              'Accept': 'application/json',
            },
          });
          
          console.log(`Response status: ${response.status}`);
          
          if (response.ok) {
            responseData = await response.json();
            successfulEndpoint = url;
            console.log(`Success with: ${url}`);
            break;
          } else {
            const errorText = await response.text();
            console.log(`${url} returned ${response.status}: ${errorText.substring(0, 500)}`);
          }
        }
        
        if (successfulEndpoint && responseData) {
          // Extract listing/property IDs from response
          const items = responseData.data || responseData || [];
          const listings = Array.isArray(items) ? items.map((item: any) => ({
            id: item.id,
            name: item.name || item.title || item.nickname || 'Unknown',
            platform: item.platform || 'unknown',
          })) : [];
          
          return new Response(
            JSON.stringify({
              success: true,
              message: 'Hospitable API connection successful',
              endpoint: successfulEndpoint,
              listings_count: listings.length,
              listings: listings.slice(0, 10), // Return first 10 for preview
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        } else {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'Could not connect to Hospitable API. Please verify your API key.',
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } catch (testError) {
        console.error('Test connection error:', testError);
        return new Response(
          JSON.stringify({
            success: false,
            error: `Connection test failed: ${testError.message}`,
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log('Starting Hospitable pricing sync', { property_ids, organization_id });

    // Fetch properties - include pricelabs_listing_id as it may contain numeric Hospitable ID
    let query = supabase
      .from('properties')
      .select('id, title, hospitable_property_id, pricelabs_listing_id, price_per_night')
      .not('hospitable_property_id', 'is', null);

    if (property_ids && property_ids.length > 0) {
      query = query.in('id', property_ids);
    }

    if (organization_id) {
      query = query.eq('organization_id', organization_id);
    }

    const { data: properties, error: propertiesError } = await query;

    if (propertiesError) {
      console.error('Error fetching properties:', propertiesError);
      throw propertiesError;
    }

    if (!properties || properties.length === 0) {
      console.log('No properties with Hospitable IDs found');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No properties with Hospitable IDs found',
          results: [] 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${properties.length} properties with Hospitable IDs`);

    const results = [];
    const today = new Date();
    const startDate = today.toISOString().split('T')[0];
    const endDate = new Date(today.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    for (const property of properties) {
      try {
        // Use the hospitable_property_id (UUID) for API calls
        // The pricelabs_listing_id is numeric and only used by PriceLabs, not Hospitable
        const hospitableId = property.hospitable_property_id;

        console.log(`Syncing pricing for property: ${property.title}`);
        console.log(`Hospitable ID: ${hospitableId}`);

        let calendarData: CalendarDay[] | null = null;
        let usedEndpoint = '';
        let lastError = '';

        const result = await fetchCalendarData(hospitableId, hospitableApiKey, startDate, endDate);
        
        if (result.data && result.data.length > 0) {
          calendarData = result.data;
          usedEndpoint = result.endpoint;
          console.log(`Success: ${result.data.length} days`);
        } else {
          lastError = result.error || 'No data returned';
        }

        if (!calendarData || calendarData.length === 0) {
          console.error(`Failed to fetch calendar for ${property.title}: ${lastError}`);
          results.push({
            property_id: property.id,
            property_title: property.title,
            hospitable_id: property.hospitable_property_id,
            pricelabs_id: property.pricelabs_listing_id,
            success: false,
            error: lastError || 'No calendar data returned'
          });
          continue;
        }

        console.log(`Received ${calendarData.length} calendar days from ${usedEndpoint}`);

        // Transform calendar data to pricing records
        const pricingRecords = calendarData
          .filter(day => day.price && day.price > 0)
          .map(day => ({
            property_id: property.id,
            date: day.date,
            base_price: property.price_per_night || day.price,
            hospitable_price: day.price,
            final_price: day.price,
            pricing_source: 'hospitable',
          }));

        if (pricingRecords.length === 0) {
          console.log(`No valid pricing data for ${property.title}`);
          results.push({
            property_id: property.id,
            property_title: property.title,
            hospitable_id: property.hospitable_property_id,
            pricelabs_id: property.pricelabs_listing_id,
            success: false,
            error: 'No valid pricing data'
          });
          continue;
        }

        // Upsert pricing records in batches
        const batchSize = 100;
        let totalUpserted = 0;

        for (let i = 0; i < pricingRecords.length; i += batchSize) {
          const batch = pricingRecords.slice(i, i + batchSize);
          
          const { error: upsertError } = await supabase
            .from('dynamic_pricing')
            .upsert(batch, {
              onConflict: 'property_id,date',
              ignoreDuplicates: false,
            });

          if (upsertError) {
            console.error(`Upsert error for ${property.title}:`, upsertError);
            throw upsertError;
          }

          totalUpserted += batch.length;
        }

        console.log(`Successfully synced ${totalUpserted} prices for ${property.title}`);

        results.push({
          property_id: property.id,
          property_title: property.title,
          hospitable_id: property.hospitable_property_id,
          pricelabs_id: property.pricelabs_listing_id,
          success: true,
          prices_synced: totalUpserted,
          endpoint_used: usedEndpoint
        });

      } catch (propertyError) {
        console.error(`Error syncing property ${property.title}:`, propertyError);
        results.push({
          property_id: property.id,
          property_title: property.title,
          hospitable_id: property.hospitable_property_id,
          pricelabs_id: property.pricelabs_listing_id,
          success: false,
          error: propertyError.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const totalPrices = results.reduce((sum, r) => sum + (r.prices_synced || 0), 0);

    console.log(`Sync complete: ${successCount}/${results.length} properties, ${totalPrices} total prices`);

    return new Response(
      JSON.stringify({
        success: true,
        total_properties: properties.length,
        successful_syncs: successCount,
        total_prices_updated: totalPrices,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Hospitable sync error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
