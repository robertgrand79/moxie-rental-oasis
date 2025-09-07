import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const pricelabsApiKey = Deno.env.get('PRICELABS_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface PricingData {
  property_id: string;
  date: string;
  price: number;
  minimum_stay: number;
  available: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting PriceLabs sync...');

    // Get all properties that need pricing sync
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('id, title, external_property_ids')
      .eq('is_active', true);

    if (propertiesError) {
      console.error('Error fetching properties:', propertiesError);
      throw propertiesError;
    }

    console.log(`Found ${properties?.length || 0} properties to sync`);

    const syncResults = [];

    for (const property of properties || []) {
      try {
        // Get PriceLabs property ID from external_property_ids
        const externalIds = property.external_property_ids || {};
        const pricelabsPropertyId = externalIds.pricelabs;

        if (!pricelabsPropertyId) {
          console.log(`Skipping property ${property.id} - no PriceLabs ID configured`);
          continue;
        }

        // Fetch pricing data from PriceLabs API
        const pricelabsResponse = await fetch(
          `https://api.pricelabs.co/v1/listings/${pricelabsPropertyId}/pricing`,
          {
            headers: {
              'Authorization': `Bearer ${pricelabsApiKey}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!pricelabsResponse.ok) {
          console.error(`PriceLabs API error for property ${property.id}:`, pricelabsResponse.status);
          continue;
        }

        const pricelabsData = await pricelabsResponse.json();
        console.log(`Fetched pricing data for property ${property.id}`);

        // Process and store pricing data
        const pricingEntries = [];
        
        for (const [dateStr, pricing] of Object.entries(pricelabsData.pricing || {})) {
          const pricingData = pricing as any;
          
          pricingEntries.push({
            property_id: property.id,
            date: dateStr,
            base_price: property.price_per_night || 0,
            pricelabs_price: pricingData.price,
            final_price: pricingData.price,
            pricing_source: 'pricelabs',
            market_demand: pricingData.demand_level || null,
            occupancy_rate: pricingData.occupancy_rate || null,
            special_events: pricingData.events || null,
            updated_at: new Date().toISOString()
          });
        }

        // Batch insert/update pricing data
        if (pricingEntries.length > 0) {
          const { error: pricingError } = await supabase
            .from('dynamic_pricing')
            .upsert(pricingEntries, {
              onConflict: 'property_id,date'
            });

          if (pricingError) {
            console.error(`Error updating pricing for property ${property.id}:`, pricingError);
          } else {
            console.log(`Updated ${pricingEntries.length} pricing entries for property ${property.id}`);
          }
        }

        syncResults.push({
          property_id: property.id,
          property_title: property.title,
          entries_synced: pricingEntries.length,
          status: 'success'
        });

      } catch (error) {
        console.error(`Error syncing property ${property.id}:`, error);
        syncResults.push({
          property_id: property.id,
          property_title: property.title,
          status: 'error',
          error: error.message
        });
      }
    }

    // Log sync completion
    const { error: logError } = await supabase
      .from('sync_logs')
      .insert({
        platform: 'pricelabs',
        sync_type: 'pricing',
        status: 'completed',
        details: {
          properties_processed: syncResults.length,
          successful_syncs: syncResults.filter(r => r.status === 'success').length,
          failed_syncs: syncResults.filter(r => r.status === 'error').length,
          sync_results: syncResults
        }
      });

    if (logError) {
      console.error('Error logging sync results:', logError);
    }

    console.log('PriceLabs sync completed');

    return new Response(JSON.stringify({
      success: true,
      message: 'PriceLabs sync completed',
      results: syncResults
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('PriceLabs sync error:', error);
    
    // Log sync failure
    await supabase
      .from('sync_logs')
      .insert({
        platform: 'pricelabs',
        sync_type: 'pricing',
        status: 'failed',
        error_message: error.message,
        details: { error: error.message }
      });

    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});