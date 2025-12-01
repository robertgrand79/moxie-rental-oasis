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

interface HospitableCalendarResponse {
  data: CalendarDay[];
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

    const { property_ids, organization_id } = await req.json().catch(() => ({}));

    console.log('Starting Hospitable pricing sync', { property_ids, organization_id });

    // Fetch properties with hospitable_property_id
    let query = supabase
      .from('properties')
      .select('id, title, hospitable_property_id, price_per_night')
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
        console.log(`Syncing pricing for property: ${property.title} (${property.hospitable_property_id})`);

        // Fetch calendar data from Hospitable API
        const calendarUrl = `https://api.hospitable.com/v2/properties/${property.hospitable_property_id}/calendar_days?start_date=${startDate}&end_date=${endDate}`;
        
        console.log(`Fetching calendar from: ${calendarUrl}`);

        const response = await fetch(calendarUrl, {
          headers: {
            'Authorization': `Bearer ${hospitableApiKey}`,
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Hospitable API error for ${property.title}:`, response.status, errorText);
          results.push({
            property_id: property.id,
            property_title: property.title,
            success: false,
            error: `API error: ${response.status} - ${errorText}`
          });
          continue;
        }

        const calendarData: HospitableCalendarResponse = await response.json();
        
        if (!calendarData.data || calendarData.data.length === 0) {
          console.log(`No calendar data returned for ${property.title}`);
          results.push({
            property_id: property.id,
            property_title: property.title,
            success: false,
            error: 'No calendar data returned'
          });
          continue;
        }

        console.log(`Received ${calendarData.data.length} calendar days for ${property.title}`);

        // Transform calendar data to pricing records
        const pricingRecords = calendarData.data
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
          success: true,
          prices_synced: totalUpserted
        });

      } catch (propertyError) {
        console.error(`Error syncing property ${property.title}:`, propertyError);
        results.push({
          property_id: property.id,
          property_title: property.title,
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
