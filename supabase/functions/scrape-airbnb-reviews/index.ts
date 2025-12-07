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
    const { propertyId, airbnbUrl, organizationId } = await req.json();

    if (!propertyId && !airbnbUrl) {
      return new Response(
        JSON.stringify({ error: 'Property ID or Airbnb URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get property details if only propertyId provided
    let listingUrl = airbnbUrl;
    let targetPropertyId = propertyId;
    let effectiveOrgId = organizationId;

    if (propertyId && !airbnbUrl) {
      const { data: property, error: propError } = await supabase
        .from('properties')
        .select('id, airbnb_listing_url, organization_id')
        .eq('id', propertyId)
        .single();

      if (propError || !property?.airbnb_listing_url) {
        return new Response(
          JSON.stringify({ error: 'Property not found or missing Airbnb URL' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      listingUrl = property.airbnb_listing_url;
      effectiveOrgId = effectiveOrgId || property.organization_id;
    }

    // Get Apify API key - check organization first, then fall back to global secret
    let apifyApiKey: string | null = null;

    if (effectiveOrgId) {
      const { data: org } = await supabase
        .from('organizations')
        .select('apify_api_key')
        .eq('id', effectiveOrgId)
        .single();
      apifyApiKey = org?.apify_api_key;
      if (apifyApiKey) {
        console.log('Using organization-level Apify API key');
      }
    }

    // Fall back to global secret if no org key
    if (!apifyApiKey) {
      apifyApiKey = Deno.env.get('APIFY_API_KEY');
      if (apifyApiKey) {
        console.log('Using global Apify API key');
      }
    }

    if (!apifyApiKey) {
      return new Response(
        JSON.stringify({ error: 'APIFY_API_KEY not configured for this organization' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate that we have a targetPropertyId - critical for proper data association
    if (!targetPropertyId) {
      console.error('No property ID provided or determined');
      return new Response(
        JSON.stringify({ 
          error: 'Property ID is required',
          details: 'Reviews must be associated with a property. Please provide a propertyId in your request.'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Syncing reviews for property ID: ${targetPropertyId}`);

    console.log(`Starting Airbnb scrape for URL: ${listingUrl}`);

    // Validate URL format - must be a listing URL, not a host profile URL
    if (!listingUrl.includes('/rooms/') && !listingUrl.includes('/listings/')) {
      console.error('Invalid URL format. Expected listing URL like https://www.airbnb.com/rooms/12345678');
      return new Response(
        JSON.stringify({ 
          error: 'Invalid Airbnb URL format', 
          details: 'Please use an individual listing URL (e.g., https://www.airbnb.com/rooms/12345678) instead of a host profile URL (e.g., https://www.airbnb.com/h/username). You can find the listing URL by visiting your property on Airbnb.',
          receivedUrl: listingUrl
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call Apify Airbnb Reviews Scraper (tri_angle)
    const apifyResponse = await fetch('https://api.apify.com/v2/acts/tri_angle~airbnb-reviews-scraper/run-sync-get-dataset-items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apifyApiKey}`,
      },
      body: JSON.stringify({
        startUrls: [{ url: listingUrl }],
        maxReviews: 1000,
        proxy: {
          useApifyProxy: true,
          apifyProxyGroups: ['RESIDENTIAL']
        }
      }),
    });

    if (!apifyResponse.ok) {
      const errorText = await apifyResponse.text();
      console.error('Apify API error:', errorText);
      let apifyError;
      try {
        apifyError = JSON.parse(errorText);
      } catch {
        apifyError = { error: errorText };
      }
      return new Response(
        JSON.stringify({ 
          error: 'Apify scraper failed', 
          details: apifyError?.error?.message || apifyError?.error || errorText,
          receivedUrl: listingUrl
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apifyData = await apifyResponse.json();
    console.log('Apify response received:', JSON.stringify(apifyData).substring(0, 500));

    // Extract reviews from Apify response (reviews are returned directly)
    if (!apifyData || apifyData.length === 0) {
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

    const reviews = apifyData;
    console.log(`Found ${reviews.length} reviews`);

    // Get existing review IDs to prevent duplicates
    const { data: existingReviews } = await supabase
      .from('testimonials')
      .select('external_review_id')
      .eq('property_id', targetPropertyId)
      .ilike('booking_platform', 'airbnb')
      .not('external_review_id', 'is', null);

    const existingIds = new Set(existingReviews?.map(r => r.external_review_id) || []);

    // Prepare new reviews for insertion
    const newReviews = reviews
      .filter((review: any) => !existingIds.has(review.id || review.reviewId))
      .map((review: any) => ({
        property_id: targetPropertyId,
        guest_name: review.reviewerName || review.author?.name || review.author?.firstName || 'Airbnb Guest',
        guest_location: review.reviewerLocation || review.author?.location || null,
        guest_avatar_url: review.reviewerProfilePicture || review.author?.pictureUrl || review.author?.thumbnailUrl || null,
        rating: review.rating || 5,
        review_text: review.comment || review.text || review.comments || '',
        stay_date: review.date ? new Date(review.date).toISOString() : 
                  (review.createdAt ? new Date(review.createdAt).toISOString() : new Date().toISOString()),
        booking_platform: 'Airbnb',
        external_review_id: review.id || review.reviewId,
        is_active: true,
        is_featured: false,
        display_order: 0,
        created_by: '00000000-0000-0000-0000-000000000000', // System import identifier
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