import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { device_id } = await req.json();

    if (!device_id) {
      return new Response(
        JSON.stringify({ error: 'device_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get device status
    const { data: device, error: deviceError } = await supabase
      .from('tv_device_pairings')
      .select(`
        id,
        is_paired,
        display_mode,
        guest_email,
        pairing_code,
        pairing_code_expires_at,
        property_id,
        properties(id, title, location)
      `)
      .eq('device_id', device_id)
      .single();

    if (deviceError || !device) {
      return new Response(
        JSON.stringify({ 
          error: 'Device not found',
          should_register: true 
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update last_seen_at
    await supabase
      .from('tv_device_pairings')
      .update({ last_seen_at: new Date().toISOString() })
      .eq('id', device.id);

    // Check if pairing code is expired
    let pairingCodeValid = false;
    if (device.pairing_code && device.pairing_code_expires_at) {
      pairingCodeValid = new Date(device.pairing_code_expires_at) > new Date();
    }

    return new Response(
      JSON.stringify({
        device_id: device.id,
        is_paired: device.is_paired,
        display_mode: device.display_mode,
        guest_email: device.guest_email,
        pairing_code: pairingCodeValid ? device.pairing_code : null,
        pairing_code_expired: device.pairing_code && !pairingCodeValid,
        property: device.properties,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in tv-device-status:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
