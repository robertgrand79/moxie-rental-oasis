
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let result;

    switch (type) {
      case 'poi':
        result = await supabase
          .from('points_of_interest')
          .insert(data);
        break;
      case 'events':
        result = await supabase
          .from('eugene_events')
          .insert(data);
        break;
      case 'lifestyle':
        result = await supabase
          .from('lifestyle_gallery')
          .insert(data);
        break;
      case 'site-content':
        // Handle site content updates to site_settings table
        if (data.length > 0) {
          const updates = data[0];
          result = await supabase
            .from('site_settings')
            .update(updates)
            .eq('id', 1);
        }
        break;
      default:
        throw new Error(`Unknown content type: ${type}`);
    }

    if (result?.error) {
      throw result.error;
    }

    console.log(`Applied ${type} content successfully:`, data.length, 'items');

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error applying generated content:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to apply content' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
