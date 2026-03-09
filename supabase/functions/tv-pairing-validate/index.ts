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

    const { pairing_code, email } = await req.json();

    console.log('TV Pairing Validation:', { pairing_code, email });

    if (!pairing_code || !email) {
      return new Response(
        JSON.stringify({ error: 'pairing_code and email are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find device with this pairing code
    const { data: device, error: deviceError } = await supabase
      .from('tv_device_pairings')
      .select('*, properties(id, title)')
      .eq('pairing_code', pairing_code)
      .eq('is_paired', false)
      .single();

    if (deviceError || !device) {
      console.log('Device not found or already paired');
      return new Response(
        JSON.stringify({ error: 'Invalid or expired pairing code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if code is expired
    if (device.pairing_code_expires_at && new Date(device.pairing_code_expires_at) < new Date()) {
      console.log('Pairing code expired');
      return new Response(
        JSON.stringify({ error: 'Pairing code has expired' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Optional: Validate email against reservation
    // For now, we'll accept any email and just pair the device
    // In production, you might want to verify the email matches a current reservation

    // Update device as paired
    const { error: updateError } = await supabase
      .from('tv_device_pairings')
      .update({
        is_paired: true,
        paired_at: new Date().toISOString(),
        guest_email: email,
        display_mode: 'guest_portal',
        pairing_code: null, // Clear the code after successful pairing
        pairing_code_expires_at: null,
      })
      .eq('id', device.id);

    if (updateError) throw updateError;

    // Log the pairing
    await supabase
      .from('tv_pairing_audit_logs')
      .insert({
        device_pairing_id: device.id,
        organization_id: device.organization_id,
        action: 'device_paired',
        guest_email: email,
        details: { pairing_code },
      });

    console.log('Device paired successfully:', device.id);

    return new Response(
      JSON.stringify({
        success: true,
        device_id: device.id,
        property_name: device.properties?.title,
        message: 'TV paired successfully! You can now use the guest portal.',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in tv-pairing-validate:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
