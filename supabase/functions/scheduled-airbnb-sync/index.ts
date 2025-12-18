import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting scheduled Airbnb sync...');

    // Get all properties with Airbnb listing URLs
    const { data: properties, error: propError } = await supabase
      .from('properties')
      .select('id, title, airbnb_listing_url')
      .not('airbnb_listing_url', 'is', null);

    if (propError) {
      throw propError;
    }

    if (!properties || properties.length === 0) {
      console.log('No properties with Airbnb URLs found');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No properties to sync',
          propertiesSynced: 0
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${properties.length} properties to sync`);

    const results = [];
    let totalReviewsImported = 0;

    // Sync each property
    for (const property of properties) {
      try {
        console.log(`Syncing property: ${property.title} (${property.id})`);

        // Call the Firecrawl-based scrape function
        const scrapeResponse = await fetch(
          `${supabaseUrl}/functions/v1/scrape-airbnb-firecrawl`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({
              propertyId: property.id,
              airbnbUrl: property.airbnb_listing_url,
            }),
          }
        );

        const scrapeResult = await scrapeResponse.json();

        results.push({
          propertyId: property.id,
          propertyTitle: property.title,
          success: scrapeResponse.ok,
          ...scrapeResult,
        });

        if (scrapeResponse.ok && scrapeResult.reviewsImported) {
          totalReviewsImported += scrapeResult.reviewsImported;
        }

        // Add delay between properties to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`Error syncing property ${property.id}:`, error);
        
        // Log error in sync log
        await supabase
          .from('airbnb_sync_log')
          .insert({
            property_id: property.id,
            sync_status: 'failed',
            error_message: error.message,
            last_sync_at: new Date().toISOString(),
          });

        results.push({
          propertyId: property.id,
          propertyTitle: property.title,
          success: false,
          error: error.message,
        });
      }
    }

    const successCount = results.filter(r => r.success).length;

    console.log(`Sync complete: ${successCount}/${properties.length} properties synced successfully`);
    console.log(`Total reviews imported: ${totalReviewsImported}`);

    return new Response(
      JSON.stringify({
        success: true,
        propertiesSynced: successCount,
        propertiesTotal: properties.length,
        totalReviewsImported,
        results,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in scheduled-airbnb-sync:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
