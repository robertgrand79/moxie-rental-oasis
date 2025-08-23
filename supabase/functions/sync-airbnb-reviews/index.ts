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
  success: boolean;
  data: {
    reviews: WextractorReview[];
    total_reviews: number;
  };
  error?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { property_id } = await req.json()
    
    if (!property_id) {
      throw new Error('Property ID is required')
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const wextractorApiKey = Deno.env.get('WEXTRACTOR_API_KEY')!
    
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

    // Call Wextractor API to fetch reviews
    console.log('🌐 Calling Wextractor API...')
    const wextractorResponse = await fetch('https://api.wextractor.com/v1/airbnb/reviews', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${wextractorApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: property.airbnb_listing_url,
        limit: 100 // Fetch up to 100 most recent reviews
      })
    })

    if (!wextractorResponse.ok) {
      throw new Error(`Wextractor API error: ${wextractorResponse.status} ${wextractorResponse.statusText}`)
    }

    const reviewsData: WextractorResponse = await wextractorResponse.json()
    
    if (!reviewsData.success) {
      throw new Error(`Wextractor error: ${reviewsData.error}`)
    }

    console.log(`📊 Found ${reviewsData.data.reviews.length} reviews from Wextractor`)

    let newReviewsCount = 0
    const reviews = reviewsData.data.reviews || []

    // Process each review
    for (const review of reviews) {
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
        total_reviews_found: reviews.length,
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

    console.log(`🎉 Sync completed! Imported ${newReviewsCount} new reviews out of ${reviews.length} total`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully synced ${newReviewsCount} new reviews from ${reviews.length} total reviews found`,
        data: {
          property_id,
          total_reviews_found: reviews.length,
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
          property_id: (await req.json())?.property_id,
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