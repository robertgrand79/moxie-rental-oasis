import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Schema for Firecrawl's AI-powered JSON extraction
const reviewSchema = {
  type: "object",
  properties: {
    reviews: {
      type: "array",
      items: {
        type: "object",
        properties: {
          reviewerName: { type: "string", description: "Name of the reviewer" },
          reviewerLocation: { type: "string", description: "Location/country of the reviewer" },
          reviewerAvatar: { type: "string", description: "URL to reviewer's profile picture" },
          rating: { type: "number", description: "Star rating from 1 to 5" },
          comment: { type: "string", description: "Full review text/comment" },
          date: { type: "string", description: "Date of the review (e.g., 'December 2024')" },
          stayDate: { type: "string", description: "When the guest stayed (e.g., 'Stayed in November 2024')" }
        },
        required: ["reviewerName", "comment"]
      }
    },
    totalReviews: { type: "number", description: "Total number of reviews for this listing" },
    averageRating: { type: "number", description: "Average star rating (e.g., 4.95)" }
  },
  required: ["reviews"]
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { propertyId, airbnbUrl, organizationId } = await req.json();
    
    console.log('Firecrawl Airbnb scraper called:', { propertyId, airbnbUrl, organizationId });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    
    if (!firecrawlApiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get property details if only propertyId provided
    let listingUrl = airbnbUrl;
    let propId = propertyId;
    
    if (!listingUrl && propertyId) {
      const { data: property, error: propError } = await supabase
        .from('properties')
        .select('airbnb_listing_id, name')
        .eq('id', propertyId)
        .single();

      if (propError || !property?.airbnb_listing_id) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Property not found or no Airbnb listing ID configured' 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      listingUrl = property.airbnb_listing_id;
      console.log(`Found Airbnb URL for ${property.name}: ${listingUrl}`);
    }

    // Ensure URL is properly formatted
    if (!listingUrl.startsWith('http')) {
      listingUrl = `https://www.airbnb.com/rooms/${listingUrl}`;
    }

    // Append reviews section to URL if not already there
    const reviewsUrl = listingUrl.includes('/reviews') 
      ? listingUrl 
      : `${listingUrl.replace(/\/$/, '')}/reviews`;

    console.log('Scraping reviews from:', reviewsUrl);

    // Call Firecrawl scrape API with JSON extraction
    const firecrawlResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: reviewsUrl,
        formats: [
          { type: 'json', schema: reviewSchema, prompt: 'Extract all guest reviews from this Airbnb listing page. Include reviewer name, location, rating, comment text, and date.' }
        ],
        waitFor: 3000, // Wait for dynamic content to load
      }),
    });

    const firecrawlData = await firecrawlResponse.json();

    if (!firecrawlResponse.ok) {
      console.error('Firecrawl API error:', firecrawlData);
      
      // Log failed sync
      await supabase.from('airbnb_sync_log').insert({
        property_id: propId,
        sync_status: 'failed',
        error_message: firecrawlData.error || `Firecrawl API error: ${firecrawlResponse.status}`,
        reviews_found: 0,
        reviews_imported: 0,
        last_sync_at: new Date().toISOString()
      });

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: firecrawlData.error || 'Failed to scrape Airbnb reviews' 
        }),
        { status: firecrawlResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Firecrawl response:', JSON.stringify(firecrawlData).substring(0, 500));

    // Extract reviews from response
    const extractedData = firecrawlData.data?.json || firecrawlData.json || {};
    const reviews = extractedData.reviews || [];
    
    console.log(`Extracted ${reviews.length} reviews`);

    if (reviews.length === 0) {
      await supabase.from('airbnb_sync_log').insert({
        property_id: propId,
        sync_status: 'completed',
        reviews_found: 0,
        reviews_imported: 0,
        last_sync_at: new Date().toISOString()
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          reviewsFound: 0, 
          reviewsImported: 0, 
          message: 'No reviews found on the listing page' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get existing testimonials to filter duplicates
    const { data: existingTestimonials } = await supabase
      .from('testimonials')
      .select('external_review_id, guest_name, review_text')
      .eq('property_id', propId);

    const existingIds = new Set(
      existingTestimonials?.map(t => t.external_review_id).filter(Boolean) || []
    );
    const existingTexts = new Set(
      existingTestimonials?.map(t => `${t.guest_name}:${t.review_text?.substring(0, 50)}`).filter(Boolean) || []
    );

    // Map and filter reviews
    const newReviews = reviews
      .filter((review: any) => {
        // Generate a unique ID based on reviewer name and comment
        const reviewId = `firecrawl_${review.reviewerName?.replace(/\s+/g, '_')}_${review.comment?.substring(0, 20)?.replace(/\s+/g, '_')}`;
        const textKey = `${review.reviewerName}:${review.comment?.substring(0, 50)}`;
        
        // Skip if already exists
        if (existingIds.has(reviewId) || existingTexts.has(textKey)) {
          return false;
        }
        return true;
      })
      .map((review: any) => {
        // Parse date from various formats
        let stayDate = null;
        if (review.stayDate) {
          const dateMatch = review.stayDate.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/i);
          if (dateMatch) {
            const monthMap: Record<string, string> = {
              'january': '01', 'february': '02', 'march': '03', 'april': '04',
              'may': '05', 'june': '06', 'july': '07', 'august': '08',
              'september': '09', 'october': '10', 'november': '11', 'december': '12'
            };
            const month = monthMap[dateMatch[1].toLowerCase()];
            stayDate = `${dateMatch[2]}-${month}-15`;
          }
        } else if (review.date) {
          const dateMatch = review.date.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/i);
          if (dateMatch) {
            const monthMap: Record<string, string> = {
              'january': '01', 'february': '02', 'march': '03', 'april': '04',
              'may': '05', 'june': '06', 'july': '07', 'august': '08',
              'september': '09', 'october': '10', 'november': '11', 'december': '12'
            };
            const month = monthMap[dateMatch[1].toLowerCase()];
            stayDate = `${dateMatch[2]}-${month}-15`;
          }
        }

        return {
          property_id: propId,
          guest_name: review.reviewerName || 'Anonymous Guest',
          guest_location: review.reviewerLocation || null,
          guest_avatar_url: review.reviewerAvatar || null,
          review_text: review.comment,
          rating: review.rating || 5,
          stay_date: stayDate,
          booking_platform: 'airbnb',
          external_review_id: `firecrawl_${review.reviewerName?.replace(/\s+/g, '_')}_${review.comment?.substring(0, 20)?.replace(/\s+/g, '_')}`,
          is_featured: false,
          created_by: null // System-imported review
        };
      });

    console.log(`Found ${reviews.length} reviews, ${newReviews.length} are new`);

    // Insert new reviews
    let reviewsImported = 0;
    if (newReviews.length > 0) {
      const { data: insertedReviews, error: insertError } = await supabase
        .from('testimonials')
        .insert(newReviews)
        .select();

      if (insertError) {
        console.error('Error inserting reviews:', insertError);
      } else {
        reviewsImported = insertedReviews?.length || 0;
        console.log(`Successfully imported ${reviewsImported} reviews`);
      }
    }

    // Log successful sync
    await supabase.from('airbnb_sync_log').insert({
      property_id: propId,
      sync_status: 'completed',
      reviews_found: reviews.length,
      reviews_imported: reviewsImported,
      last_sync_at: new Date().toISOString()
    });

    return new Response(
      JSON.stringify({
        success: true,
        reviewsFound: reviews.length,
        reviewsImported,
        averageRating: extractedData.averageRating,
        totalReviews: extractedData.totalReviews,
        message: reviewsImported > 0 
          ? `Imported ${reviewsImported} new reviews` 
          : 'No new reviews to import'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Firecrawl scraper error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
