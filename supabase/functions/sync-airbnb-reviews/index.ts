import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WextractorReview {
  reviewer_name: string;
  reviewer_avatar?: string;
  rating: number;
  review_text: string;
  date: string;
  reviewer_location?: string;
  review_id: string;
}

interface WextractorResponse {
  totals: {
    review_count: number;
  };
  reviews: WextractorReview[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  let property_id: string
  try {
    const body = await req.json()
    property_id = body.property_id
    
    if (!property_id) {
      throw new Error('Property ID is required')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const wextractorApiKey = Deno.env.get('WEXTRACTOR_API_KEY')
    
    console.log('🔧 Environment variables check:')
    console.log('🔑 SUPABASE_URL present:', supabaseUrl ? 'Yes' : 'No')
    console.log('🔑 SUPABASE_SERVICE_ROLE_KEY present:', supabaseKey ? 'Yes' : 'No')
    console.log('🔑 WEXTRACTOR_API_KEY present:', wextractorApiKey ? 'Yes' : 'No')
    console.log('🔑 WEXTRACTOR_API_KEY length:', wextractorApiKey ? wextractorApiKey.length : 0)
    
    if (!wextractorApiKey) {
      console.error('❌ WEXTRACTOR_API_KEY environment variable is not set')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'WEXTRACTOR_API_KEY not configured' 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey)

    console.log(`🔄 Starting Airbnb review sync for property: ${property_id}`)

    // Get property with Airbnb URL
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('id, title, airbnb_listing_url')
      .eq('id', property_id)
      .single()

    if (propertyError || !property?.airbnb_listing_url) {
      throw new Error('Property not found or missing Airbnb listing URL')
    }

    console.log(`📍 Found property: ${property.title}, URL: ${property.airbnb_listing_url}`)

    // Extract Airbnb partial URL for Wextractor
    let airbnbId: string
    
    // Handle /rooms/ URLs (create partial URL like "airbnb.com/rooms/123456")
    const roomsMatch = property.airbnb_listing_url.match(/\/rooms\/(\d+)/);
    if (roomsMatch) {
      airbnbId = `airbnb.com/rooms/${roomsMatch[1]}`;
    } 
    // Handle /h/ URLs (create partial URL like "airbnb.com/h/hostname")
    else {
      const hostMatch = property.airbnb_listing_url.match(/\/h\/([^\/\?]+)/);
      if (hostMatch) {
        airbnbId = `airbnb.com/h/${hostMatch[1]}`;
      } else {
        throw new Error('Could not extract property ID from Airbnb URL. URL should contain /rooms/{id} or /h/{host-name}')
      }
    }
    
    console.log(`🔍 Extracted Airbnb partial URL: ${airbnbId}`)
    console.log(`🔗 Original URL: ${property.airbnb_listing_url}`)

    // Update sync metadata to indicate sync started
    const { error: syncStartError } = await supabase
      .from('sync_metadata')
      .upsert({
        property_id: property_id,
        sync_type: 'airbnb_reviews',
        sync_status: 'in_progress',
        error_message: null,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'property_id,sync_type',
        ignoreDuplicates: false
      })

    if (syncStartError) {
      console.error('❌ Failed to update sync metadata:', syncStartError)
    }

    // Fetch reviews with pagination (Wextractor returns 10 reviews per request)
    console.log('🌐 Calling Wextractor API...')
    const allReviews: WextractorReview[] = []
    let offset = 0
    let totalReviews = 0
    const maxReviews = 100 // Limit to prevent excessive API calls

    do {
      // Based on Wextractor documentation, they expect 'id' parameter with just the identifier
      const wextractorUrl = new URL('https://wextractor.com/api/v1/reviews/airbnb')
      wextractorUrl.searchParams.set('auth_token', wextractorApiKey)
      wextractorUrl.searchParams.set('offset', offset.toString())
      
      // Extract the correct ID format based on Wextractor API documentation
      let justId: string
      const roomsMatch = property.airbnb_listing_url.match(/\/rooms\/(\d+)/);
      if (roomsMatch) {
        // For /rooms/ URLs like https://www.airbnb.com/rooms/30748041, use just the numeric ID
        justId = roomsMatch[1];
        console.log(`🏠 Room type detected, using ID: ${justId}`)
      } else {
        // For /h/ URLs, this format is not well documented by Wextractor - try the full URL
        console.log(`⚠️ Host URL detected - this may not be supported by Wextractor API`)
        const hostMatch = property.airbnb_listing_url.match(/\/h\/([^\/\?]+)/);
        justId = hostMatch ? hostMatch[1] : '';
        
        if (!justId) {
          throw new Error(`Could not extract Airbnb ID from URL: ${property.airbnb_listing_url}`)
        }
      }
      
      wextractorUrl.searchParams.set('id', justId)
      
      // Add type parameter for rooms (default)
      wextractorUrl.searchParams.set('type', 'room')

      console.log(`📥 Fetching reviews with offset ${offset}...`)
      console.log(`🌐 Wextractor URL: ${wextractorUrl.toString()}`)
      console.log(`🔑 Using Airbnb ID: ${justId}`)
      console.log(`🔗 Original URL: ${property.airbnb_listing_url}`)
      console.log(`🔐 Auth token length: ${wextractorApiKey ? wextractorApiKey.length : 0}`)
      
      const wextractorResponse = await fetch(wextractorUrl.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      })

      console.log(`📡 Wextractor response status: ${wextractorResponse.status}`)
      
      if (!wextractorResponse.ok) {
        const errorText = await wextractorResponse.text()
        console.log(`❌ Wextractor error response body: ${errorText}`)
        console.log(`❌ Wextractor error headers: ${JSON.stringify(Object.fromEntries(wextractorResponse.headers.entries()))}`)
        throw new Error(`Wextractor API error: ${wextractorResponse.status} ${wextractorResponse.statusText} - Response: ${errorText}`)
      }

      const reviewsData: WextractorResponse = await wextractorResponse.json()
      console.log(`📊 Wextractor response data: ${JSON.stringify(reviewsData, null, 2)}`)
      
      if (offset === 0) {
        totalReviews = reviewsData.totals.review_count
        console.log(`📊 Total reviews available: ${totalReviews}`)
      }

      allReviews.push(...reviewsData.reviews)
      offset += 10 // Wextractor returns 10 reviews per page
      
      // Stop if we've reached our limit or if we got fewer than 10 reviews (last page)
      if (allReviews.length >= maxReviews || reviewsData.reviews.length < 10) {
        break
      }
    } while (offset < totalReviews)

    console.log(`📊 Retrieved ${allReviews.length} reviews from Wextractor`)

    let newReviewsCount = 0

    // Process each review
    for (const review of allReviews) {
      try {
        // Check if review already exists
        const { data: existingReview } = await supabase
          .from('testimonials')
          .select('id')
          .eq('external_review_id', review.review_id)
          .single()

        if (existingReview) {
          console.log(`⏭️ Review ${review.review_id} already exists, skipping...`)
          continue
        }

        // Parse date
        const stayDate = review.date ? new Date(review.date).toISOString().split('T')[0] : null

        // Create testimonial from review
        const testimonialData = {
          guest_name: review.reviewer_name,
          guest_location: review.reviewer_location || null,
          guest_avatar_url: review.reviewer_avatar || '/airbnb-logo.png',
          rating: review.rating,
          content: review.review_text,
          review_text: review.review_text, // For backward compatibility
          property_name: property.title,
          stay_date: stayDate,
          is_featured: false,
          is_active: false, // Require manual approval
          booking_platform: 'airbnb',
          external_review_id: review.review_id,
          created_by: property_id, // Use property ID as placeholder for system creation
          status: 'pending'
        }

        const { error: insertError } = await supabase
          .from('testimonials')
          .insert(testimonialData)

        if (insertError) {
          console.error(`❌ Failed to insert review ${review.review_id}:`, insertError)
        } else {
          newReviewsCount++
          console.log(`✅ Imported review from ${review.reviewer_name}`)
        }
      } catch (reviewError) {
        console.error(`❌ Error processing review ${review.review_id}:`, reviewError)
      }
    }

    // Update sync metadata with results
    const { error: syncCompleteError } = await supabase
      .from('sync_metadata')
      .upsert({
        property_id: property_id,
        sync_type: 'airbnb_reviews',
        last_sync_at: new Date().toISOString(),
        sync_status: 'completed',
        total_reviews_found: allReviews.length,
        new_reviews_imported: newReviewsCount,
        error_message: null,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'property_id,sync_type',
        ignoreDuplicates: false
      })

    if (syncCompleteError) {
      console.error('❌ Failed to update sync completion metadata:', syncCompleteError)
    }

    console.log(`🎉 Sync completed! Imported ${newReviewsCount} new reviews out of ${allReviews.length} total`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully synced ${newReviewsCount} new reviews from ${allReviews.length} total reviews found`,
        data: {
          property_id,
          total_reviews_found: allReviews.length,
          new_reviews_imported: newReviewsCount
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('❌ Sync error:', error)

    // Try to update sync metadata with error
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      const supabase = createClient(supabaseUrl, supabaseKey)
      
      await supabase
        .from('sync_metadata')
        .upsert({
          property_id: property_id,
          sync_type: 'airbnb_reviews',
          sync_status: 'error',
          error_message: error.message,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'property_id,sync_type',
          ignoreDuplicates: false
        })
    } catch (updateError) {
      console.error('Failed to update error metadata:', updateError)
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})