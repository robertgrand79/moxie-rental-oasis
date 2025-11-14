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
    const { propertyId, airbnbUrl } = await req.json();

    if (!propertyId && !airbnbUrl) {
      return new Response(
        JSON.stringify({ error: 'Property ID or Airbnb URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const apifyApiKey = Deno.env.get('APIFY_API_KEY');

    if (!apifyApiKey) {
      return new Response(
        JSON.stringify({ error: 'APIFY_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get property details if only propertyId provided
    let listingUrl = airbnbUrl;
    let targetPropertyId = propertyId;

    if (propertyId && !airbnbUrl) {
      const { data: property, error: propError } = await supabase
        .from('properties')
        .select('id, airbnb_listing_url')
        .eq('id', propertyId)
        .single();

      if (propError || !property?.airbnb_listing_url) {
        return new Response(
          JSON.stringify({ error: 'Property not found or missing Airbnb URL' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      listingUrl = property.airbnb_listing_url;
    }

    console.log(`Starting Airbnb scrape for URL: ${listingUrl}`);

    // Call Apify Airbnb Scraper
    const apifyResponse = await fetch('https://api.apify.com/v2/acts/dtrungtin~airbnb-scraper/run-sync-get-dataset-items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apifyApiKey}`,
      },
      body: JSON.stringify({
        startUrls: [{ url: listingUrl }],
        maxListings: 1,
        includeReviews: true,
        maxReviews: 100,
        proxyConfiguration: { useApifyProxy: true },
      }),
    });

    if (!apifyResponse.ok) {
      const errorText = await apifyResponse.text();
      console.error('Apify API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to scrape Airbnb reviews', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apifyData = await apifyResponse.json();
    console.log('Apify response received:', JSON.stringify(apifyData).substring(0, 500));

    // Extract reviews from Apify response
    const listing = apifyData[0];
    if (!listing || !listing.reviews) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          reviewsFound: 0, 
          reviewsImported: 0,
          message: 'No reviews found for this listing'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const reviews = listing.reviews || [];
    console.log(`Found ${reviews.length} reviews`);

    // Get existing review IDs to prevent duplicates
    const { data: existingReviews } = await supabase
      .from('testimonials')
      .select('external_review_id')
      .eq('property_id', targetPropertyId)
      .eq('booking_platform', 'Airbnb')
      .not('external_review_id', 'is', null);

    const existingIds = new Set(existingReviews?.map(r => r.external_review_id) || []);

    // Prepare new reviews for insertion
    const newReviews = reviews
      .filter((review: any) => !existingIds.has(review.id))
      .map((review: any) => ({
        property_id: targetPropertyId,
        guest_name: review.author?.firstName || review.author?.name || 'Airbnb Guest',
        guest_location: review.author?.location || null,
        guest_avatar_url: review.author?.pictureUrl || review.author?.thumbnailUrl || null,
        rating: review.rating || 5,
        review_text: review.comments || review.comment || '',
        stay_date: review.createdAt ? new Date(review.createdAt).toISOString() : new Date().toISOString(),
        booking_platform: 'Airbnb',
        external_review_id: review.id,
        is_active: true, // Auto-display
        is_featured: false,
        display_order: 0,
      }));

    let importedCount = 0;

    if (newReviews.length > 0) {
      const { error: insertError } = await supabase
        .from('testimonials')
        .insert(newReviews);

      if (insertError) {
        console.error('Error inserting reviews:', insertError);
        throw insertError;
      }

      importedCount = newReviews.length;
      console.log(`Imported ${importedCount} new reviews`);
    }

    // Update sync log
    await supabase
      .from('airbnb_sync_log')
      .insert({
        property_id: targetPropertyId,
        sync_status: 'completed',
        reviews_found: reviews.length,
        reviews_imported: importedCount,
        last_sync_at: new Date().toISOString(),
        next_sync_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      });

    return new Response(
      JSON.stringify({
        success: true,
        reviewsFound: reviews.length,
        reviewsImported: importedCount,
        message: `Successfully imported ${importedCount} new reviews`,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in scrape-airbnb-reviews:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
