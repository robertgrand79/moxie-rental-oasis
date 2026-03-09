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

    const { device_id, reason } = await req.json();

    console.log('TV Device Unpair:', { device_id, reason });

    if (!device_id) {
      return new Response(
        JSON.stringify({ error: 'device_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find device
    const { data: device, error: deviceError } = await supabase
      .from('tv_device_pairings')
      .select('id, guest_email, organization_id')
      .eq('device_id', device_id)
      .single();

    if (deviceError || !device) {
      return new Response(
        JSON.stringify({ error: 'Device not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate new pairing code for re-pairing
    const pairingCode = Math.random().toString().slice(2, 8);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    // Unpair device
    const { error: updateError } = await supabase
      .from('tv_device_pairings')
      .update({
        is_paired: false,
        guest_email: null,
        current_reservation_id: null,
        display_mode: 'welcome',
        pairing_code: pairingCode,
        pairing_code_expires_at: expiresAt,
      })
      .eq('id', device.id);

    if (updateError) throw updateError;

    // Log the unpair
    await supabase
      .from('tv_pairing_audit_logs')
      .insert({
        device_pairing_id: device.id,
        action: 'device_unpaired',
        guest_email: device.guest_email,
        details: { reason: reason || 'manual' },
      });

    console.log('Device unpaired successfully:', device.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Device unpaired successfully',
        new_pairing_code: pairingCode,
        expires_at: expiresAt,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in tv-device-unpair:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
