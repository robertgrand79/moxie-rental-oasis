import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const mapboxToken = Deno.env.get('MAPBOX_PUBLIC_TOKEN');
    
    if (!mapboxToken) {
      console.error('MAPBOX_PUBLIC_TOKEN not configured');
      return new Response(
        JSON.stringify({ error: 'Mapbox token not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { address, placeId, batchGeocode } = await req.json();

    // If batch geocode requested, process multiple places
    if (batchGeocode) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Get all places with addresses but no coordinates
      const { data: places, error: fetchError } = await supabase
        .from('places')
        .select('id, address, name')
        .not('address', 'is', null)
        .or('latitude.is.null,longitude.is.null');

      if (fetchError) {
        console.error('Error fetching places:', fetchError);
        throw fetchError;
      }

      console.log(`Found ${places?.length || 0} places to geocode`);

      const results = {
        success: 0,
        failed: 0,
        errors: [] as string[],
      };

      for (const place of places || []) {
        if (!place.address) continue;

        try {
          const encodedAddress = encodeURIComponent(place.address);
          const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${mapboxToken}&limit=1`;
          
          const response = await fetch(geocodeUrl);
          const data = await response.json();

          if (data.features && data.features.length > 0) {
            const [longitude, latitude] = data.features[0].center;
            
            const { error: updateError } = await supabase
              .from('places')
              .update({ latitude, longitude })
              .eq('id', place.id);

            if (updateError) {
              results.failed++;
              results.errors.push(`Failed to update ${place.name}: ${updateError.message}`);
            } else {
              results.success++;
              console.log(`Geocoded ${place.name}: ${latitude}, ${longitude}`);
            }
          } else {
            results.failed++;
            results.errors.push(`No results for ${place.name}: ${place.address}`);
          }

          // Rate limiting - Mapbox allows 600 requests per minute for free tier
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (err) {
          results.failed++;
          results.errors.push(`Error geocoding ${place.name}: ${err.message}`);
        }
      }

      return new Response(
        JSON.stringify(results),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Single address geocoding
    if (!address) {
      return new Response(
        JSON.stringify({ error: 'Address is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Geocoding address: ${address}`);

    const encodedAddress = encodeURIComponent(address);
    const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${mapboxToken}&limit=1`;
    
    const response = await fetch(geocodeUrl);
    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Address not found', address }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const [longitude, latitude] = data.features[0].center;
    const placeName = data.features[0].place_name;

    console.log(`Geocoded successfully: ${latitude}, ${longitude}`);

    // If placeId provided, update the place directly
    if (placeId) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { error: updateError } = await supabase
        .from('places')
        .update({ latitude, longitude })
        .eq('id', placeId);

      if (updateError) {
        console.error('Error updating place:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to update place', details: updateError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({ 
        latitude, 
        longitude, 
        placeName,
        success: true 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in geocode-address function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
