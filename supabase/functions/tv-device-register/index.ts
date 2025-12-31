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

    const { property_id, device_id, device_name } = await req.json();

    console.log('TV Device Registration:', { property_id, device_id, device_name });

    if (!property_id || !device_id) {
      return new Response(
        JSON.stringify({ error: 'property_id and device_id are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get property and organization info
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('id, title, organization_id')
      .eq('id', property_id)
      .single();

    if (propertyError || !property) {
      console.error('Property not found:', propertyError);
      return new Response(
        JSON.stringify({ error: 'Property not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate 6-digit pairing code
    const pairingCode = Math.random().toString().slice(2, 8);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

    // Check if device already exists
    const { data: existingDevice } = await supabase
      .from('tv_device_pairings')
      .select('id')
      .eq('device_id', device_id)
      .single();

    let result;
    if (existingDevice) {
      // Update existing device
      const { data, error } = await supabase
        .from('tv_device_pairings')
        .update({
          property_id,
          device_name: device_name || 'TV Device',
          pairing_code: pairingCode,
          pairing_code_expires_at: expiresAt,
          is_paired: false,
          guest_email: null,
          current_reservation_id: null,
          last_seen_at: new Date().toISOString(),
        })
        .eq('id', existingDevice.id)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
      console.log('Updated existing device:', result.id);
    } else {
      // Create new device
      const { data, error } = await supabase
        .from('tv_device_pairings')
        .insert({
          organization_id: property.organization_id,
          property_id,
          device_id,
          device_name: device_name || 'TV Device',
          pairing_code: pairingCode,
          pairing_code_expires_at: expiresAt,
          display_mode: 'welcome',
        })
        .select()
        .single();
      
      if (error) throw error;
      result = data;
      console.log('Created new device:', result.id);
    }

    // Log the registration
    await supabase
      .from('tv_pairing_audit_logs')
      .insert({
        device_pairing_id: result.id,
        action: 'device_registered',
        details: { device_id, device_name, property_id },
      });

    return new Response(
      JSON.stringify({
        success: true,
        device_id: result.id,
        pairing_code: pairingCode,
        expires_at: expiresAt,
        property_name: property.title,
        qr_url: `${req.headers.get('origin') || ''}/pair-tv?code=${pairingCode}`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in tv-device-register:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
