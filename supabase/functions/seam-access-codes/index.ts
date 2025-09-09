import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const seamApiKey = Deno.env.get('SEAM_API_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { action, deviceId, reservationId, accessCodeData } = await req.json();

    console.log(`Processing access code action: ${action}`);

    // Get device info
    const { data: device, error: deviceError } = await supabase
      .from('seam_devices')
      .select('*')
      .eq('id', deviceId)
      .single();

    if (deviceError || !device) {
      throw new Error(`Device not found: ${deviceError?.message || 'Unknown error'}`);
    }

    if (device.device_type !== 'smart_lock') {
      throw new Error('Access codes are only available for smart locks');
    }

    let result;

    switch (action) {
      case 'create':
        result = await createAccessCode(supabase, device, reservationId, accessCodeData);
        break;
      case 'delete':
        result = await deleteAccessCode(supabase, accessCodeData.accessCodeId);
        break;
      case 'list':
        result = await listAccessCodes(supabase, deviceId);
        break;
      default:
        throw new Error(`Unsupported action: ${action}`);
    }

    return new Response(JSON.stringify({
      success: true,
      data: result
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in seam-access-codes function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function createAccessCode(supabase: any, device: any, reservationId: string, accessCodeData: any) {
  // Get reservation details
  const { data: reservation, error: reservationError } = await supabase
    .from('property_reservations')
    .select('*')
    .eq('id', reservationId)
    .single();

  if (reservationError || !reservation) {
    throw new Error(`Reservation not found: ${reservationError?.message || 'Unknown error'}`);
  }

  // Create access code via Seam API
  const seamPayload = {
    device_id: device.seam_device_id,
    name: `${reservation.guest_name} - ${reservation.check_in_date}`,
    starts_at: reservation.check_in_date,
    ends_at: reservation.check_out_date,
    ...accessCodeData
  };

  console.log('Creating access code with Seam API:', seamPayload);

  const seamResponse = await fetch('https://connect.getseam.com/access_codes/create', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('SEAM_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(seamPayload),
  });

  if (!seamResponse.ok) {
    const errorText = await seamResponse.text();
    console.error('Seam API error:', errorText);
    throw new Error(`Seam API error: ${seamResponse.status} ${errorText}`);
  }

  const seamResult = await seamResponse.json();
  console.log('Access code created:', seamResult);

  // Store access code in database
  const { data: dbAccessCode, error: dbError } = await supabase
    .from('seam_access_codes')
    .insert({
      seam_access_code_id: seamResult.access_code.access_code_id,
      device_id: device.id,
      reservation_id: reservationId,
      code_value: seamResult.access_code.code,
      code_name: seamPayload.name,
      access_type: 'time_bound',
      starts_at: seamPayload.starts_at,
      ends_at: seamPayload.ends_at,
      is_active: true
    })
    .select()
    .single();

  if (dbError) {
    console.error('Error storing access code in database:', dbError);
    // Try to delete the Seam access code since DB storage failed
    try {
      await fetch('https://connect.getseam.com/access_codes/delete', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SEAM_API_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ access_code_id: seamResult.access_code.access_code_id }),
      });
    } catch (cleanupError) {
      console.error('Failed to cleanup Seam access code after DB error:', cleanupError);
    }
    throw dbError;
  }

  return {
    accessCode: dbAccessCode,
    seamResponse: seamResult
  };
}

async function deleteAccessCode(supabase: any, accessCodeId: string) {
  // Get access code from database
  const { data: accessCode, error: accessCodeError } = await supabase
    .from('seam_access_codes')
    .select('*')
    .eq('id', accessCodeId)
    .single();

  if (accessCodeError || !accessCode) {
    throw new Error(`Access code not found: ${accessCodeError?.message || 'Unknown error'}`);
  }

  // Delete from Seam API
  const seamResponse = await fetch('https://connect.getseam.com/access_codes/delete', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('SEAM_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ access_code_id: accessCode.seam_access_code_id }),
  });

  if (!seamResponse.ok) {
    const errorText = await seamResponse.text();
    console.error('Seam API error:', errorText);
    throw new Error(`Seam API error: ${seamResponse.status} ${errorText}`);
  }

  // Mark as inactive in database
  const { error: updateError } = await supabase
    .from('seam_access_codes')
    .update({ is_active: false })
    .eq('id', accessCodeId);

  if (updateError) {
    console.error('Error deactivating access code in database:', updateError);
    throw updateError;
  }

  return { message: 'Access code deleted successfully' };
}

async function listAccessCodes(supabase: any, deviceId: string) {
  const { data: accessCodes, error } = await supabase
    .from('seam_access_codes')
    .select(`
      *,
      seam_devices!inner(device_name, device_type),
      property_reservations(guest_name, check_in_date, check_out_date)
    `)
    .eq('device_id', deviceId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return accessCodes;
}