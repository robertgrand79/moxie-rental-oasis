
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
    const { type, data, sendForApproval = false } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // If sendForApproval is true, add to content approval queue instead of applying directly
    if (sendForApproval) {
      const approvalItems = data.map((item: any) => ({
        title: item.title || item.name || 'Generated Content',
        content: JSON.stringify(item),
        type: type,
        status: 'pending',
        original_prompt: `Generated ${type} content`,
        created_by: 'AI'
      }));

      const { error: approvalError } = await supabase
        .from('content_approval_items')
        .insert(approvalItems);

      if (approvalError) {
        throw approvalError;
      }

      console.log(`Sent ${data.length} ${type} items for approval`);

      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Content sent for approval',
        itemsCount: data.length
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Apply content directly (for approved content)
    let result;

    switch (type) {
      case 'poi':
        // Add created_by as null since it's now nullable
        const poiData = data.map((item: any) => ({ ...item, created_by: null }));
        result = await supabase
          .from('points_of_interest')
          .insert(poiData);
        break;
      case 'events':
        // Add created_by as null since it's now nullable
        const eventsData = data.map((item: any) => ({ ...item, created_by: null }));
        result = await supabase
          .from('eugene_events')
          .insert(eventsData);
        break;
      case 'lifestyle':
        // Add created_by as null since it's now nullable
        const lifestyleData = data.map((item: any) => ({ ...item, created_by: null }));
        result = await supabase
          .from('lifestyle_gallery')
          .insert(lifestyleData);
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

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Content applied successfully',
      itemsCount: data.length
    }), {
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
