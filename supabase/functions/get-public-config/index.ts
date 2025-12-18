import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    // Return platform-level public configuration
    const config = {
      mapboxToken: Deno.env.get('MAPBOX_PUBLIC_TOKEN') || '',
    };

    console.log('[get-public-config] Returning public config, mapboxToken present:', !!config.mapboxToken);

    return new Response(
      JSON.stringify(config),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('[get-public-config] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to get public config' }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
