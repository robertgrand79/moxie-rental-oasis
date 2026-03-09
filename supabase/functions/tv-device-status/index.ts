import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
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
        current_reservation_id,
        organization_id,
        properties(id, title, location)
      `)
      .eq('device_id', device_id)
      .single();

    if (deviceError || !device) {
      return new Response(
        JSON.stringify({ error: 'Device not found', should_register: true }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update last_seen_at
    await supabase
      .from('tv_device_pairings')
      .update({ last_seen_at: new Date().toISOString() })
      .eq('id', device.id);

    // --- Reservation-based state automation ---
    let newDisplayMode = device.display_mode;
    let guestName: string | null = null;
    let guestEmail = device.guest_email;
    let currentReservationId = device.current_reservation_id;

    if (device.is_paired && device.property_id) {
      const now = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

      // Look for an active reservation on this property
      const { data: activeReservation } = await supabase
        .from('property_reservations')
        .select('id, guest_name, guest_email, check_in_date, check_out_date')
        .eq('property_id', device.property_id)
        .eq('booking_status', 'confirmed')
        .lte('check_in_date', now)
        .gte('check_out_date', now)
        .order('check_in_date', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (activeReservation) {
        // Active reservation found — welcome/guest_portal mode
        if (device.current_reservation_id !== activeReservation.id || device.display_mode === 'signage') {
          newDisplayMode = 'welcome';
          guestEmail = activeReservation.guest_email;
          currentReservationId = activeReservation.id;
          guestName = activeReservation.guest_name;

          await supabase
            .from('tv_device_pairings')
            .update({
              current_reservation_id: activeReservation.id,
              guest_email: activeReservation.guest_email,
              display_mode: 'welcome',
            })
            .eq('id', device.id);

          console.log('TV auto-assigned to reservation:', activeReservation.id);
        } else {
          guestName = activeReservation.guest_name;
        }
      } else {
        // No active reservation — signage mode
        if (device.current_reservation_id || device.display_mode !== 'signage') {
          newDisplayMode = 'signage';
          guestEmail = null;
          currentReservationId = null;

          await supabase
            .from('tv_device_pairings')
            .update({
              current_reservation_id: null,
              guest_email: null,
              display_mode: 'signage',
            })
            .eq('id', device.id);

          console.log('TV switched to signage — no active reservation');
        }
      }
    }

    // Check if pairing code is expired
    let pairingCodeValid = false;
    if (device.pairing_code && device.pairing_code_expires_at) {
      pairingCodeValid = new Date(device.pairing_code_expires_at) > new Date();
    }

    return new Response(
      JSON.stringify({
        device_id: device.id,
        is_paired: device.is_paired,
        display_mode: newDisplayMode,
        guest_email: guestEmail,
        guest_name: guestName,
        current_reservation_id: currentReservationId,
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
