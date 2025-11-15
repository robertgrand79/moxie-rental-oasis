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

    console.log('Starting automated Airbnb review sync for all properties...');

    // Get all properties with Airbnb listing URLs
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select('id, airbnb_listing_url')
      .not('airbnb_listing_url', 'is', null);

    if (propertiesError) {
      console.error('Error fetching properties:', propertiesError);
      throw propertiesError;
    }

    if (!properties || properties.length === 0) {
      console.log('No properties with Airbnb URLs found');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No properties with Airbnb URLs to sync',
          propertiesSynced: 0
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${properties.length} properties to sync`);

    const results = [];

    // Sync each property sequentially to avoid rate limits
    for (const property of properties) {
      console.log(`Syncing reviews for property ID: ${property.id}`);
      
      try {
        const { data, error } = await supabase.functions.invoke('scrape-airbnb-reviews', {
          body: { 
            propertyId: property.id,
            airbnbUrl: property.airbnb_listing_url 
          }
        });

        if (error) {
          console.error(`Error syncing property ${property.id}:`, error);
          
          // Try to extract detailed error message from the response
          let errorMessage = error.message;
          let errorDetails = null;
          
          if (error.context?.body) {
            try {
              const reader = error.context.body.getReader();
              const { value } = await reader.read();
              const text = new TextDecoder().decode(value);
              const errorData = JSON.parse(text);
              errorMessage = errorData.error || errorMessage;
              errorDetails = errorData.details || null;
            } catch (e) {
              console.error('Failed to parse error response:', e);
            }
          }
          
          results.push({
            propertyId: property.id,
            propertyName: property.id,
            success: false,
            error: errorMessage,
            details: errorDetails
          });
        } else {
          console.log(`Successfully synced ${data?.reviewsImported || 0} reviews for property ${property.id}`);
          results.push({
            propertyId: property.id,
            propertyName: property.id,
            success: true,
            reviewsFound: data?.reviewsFound || 0,
            reviewsImported: data?.reviewsImported || 0
          });
        }

        // Add a small delay between requests to be respectful to Apify
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error: any) {
        console.error(`Exception syncing property ${property.id}:`, error);
        results.push({
          propertyId: property.id,
          propertyName: property.id,
          success: false,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const totalReviewsImported = results
      .filter(r => r.success)
      .reduce((sum, r) => sum + (r.reviewsImported || 0), 0);

    console.log(`Sync complete: ${successCount}/${properties.length} properties synced successfully`);
    console.log(`Total reviews imported: ${totalReviewsImported}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Synced ${successCount}/${properties.length} properties`,
        totalReviewsImported,
        results
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in scrape-all-airbnb-reviews:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
