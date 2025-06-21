
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('CORS preflight request received');
    return new Response(null, { headers: corsHeaders });
  }

  console.log('=== ACKNOWLEDGE WORK ORDER FUNCTION START ===');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    console.log('Token parameter:', token ? 'Present' : 'Missing');

    if (!token) {
      console.log('ERROR: No token provided in URL');
      // Redirect to React page with error parameter
      return new Response(null, {
        status: 302,
        headers: {
          'Location': `https://joiovubyokikqjytxtuv.lovable.app/work-order-acknowledgment/invalid?error=no-token`,
          ...corsHeaders,
        },
      });
    }

    // Redirect to React acknowledgment page with the token
    const redirectUrl = `https://joiovubyokikqjytxtuv.lovable.app/work-order-acknowledgment/${encodeURIComponent(token)}`;
    console.log('Redirecting to:', redirectUrl);

    return new Response(null, {
      status: 302,
      headers: {
        'Location': redirectUrl,
        ...corsHeaders,
      },
    });

  } catch (error) {
    console.error('=== CRITICAL ERROR IN ACKNOWLEDGE FUNCTION ===');
    console.error('Error details:', error);
    
    // Redirect to React page with error parameter
    return new Response(null, {
      status: 302,
      headers: {
        'Location': `https://joiovubyokikqjytxtuv.lovable.app/work-order-acknowledgment/error?error=server-error`,
        ...corsHeaders,
      },
    });
  }
});
