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
    const { deviceId, action, parameters = {} } = await req.json();

    if (!deviceId || !action) {
      throw new Error('Device ID and action are required');
    }

    console.log(`Executing action '${action}' on device ${deviceId}`);

    // Get device info from database
    const { data: device, error: deviceError } = await supabase
      .from('seam_devices')
      .select('*')
      .eq('id', deviceId)
      .single();

    if (deviceError || !device) {
      throw new Error(`Device not found: ${deviceError?.message || 'Unknown error'}`);
    }

    let seamEndpoint = '';
    let seamPayload: any = { device_id: device.seam_device_id };

    // Determine Seam API endpoint and payload based on action
    switch (action) {
      case 'lock':
        if (device.device_type !== 'smart_lock') {
          throw new Error('Lock action is only available for smart locks');
        }
        seamEndpoint = 'https://connect.getseam.com/locks/lock_door';
        break;

      case 'unlock':
        if (device.device_type !== 'smart_lock') {
          throw new Error('Unlock action is only available for smart locks');
        }
        seamEndpoint = 'https://connect.getseam.com/locks/unlock_door';
        break;

      case 'set_temperature':
        if (device.device_type !== 'thermostat') {
          throw new Error('Temperature control is only available for thermostats');
        }
        if (!parameters.temperature) {
          throw new Error('Temperature parameter is required');
        }
        seamEndpoint = 'https://connect.getseam.com/thermostats/set';
        seamPayload.temperature = parameters.temperature;
        break;

      case 'set_thermostat_mode':
        if (device.device_type !== 'thermostat') {
          throw new Error('Mode control is only available for thermostats');
        }
        if (!parameters.mode) {
          throw new Error('Mode parameter is required (heat, cool, auto, off)');
        }
        seamEndpoint = 'https://connect.getseam.com/thermostats/set';
        seamPayload.mode = parameters.mode;
        break;

      default:
        throw new Error(`Unsupported action: ${action}`);
    }

    // Execute action via Seam API
    const seamResponse = await fetch(seamEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${seamApiKey}`,
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
    console.log('Seam API response:', seamResult);

    // Log the device control event
    const { error: eventError } = await supabase
      .from('device_events')
      .insert({
        device_id: deviceId,
        event_type: `device.${action}`,
        event_source: 'manual',
        event_data: {
          action,
          parameters,
          seam_response: seamResult,
          timestamp: new Date().toISOString()
        }
      });

    if (eventError) {
      console.error('Error logging device control event:', eventError);
    }

    // Update device state in database if we have new state info
    if (seamResult.device || seamResult.lock || seamResult.thermostat) {
      const newState = seamResult.device || seamResult.lock || seamResult.thermostat;
      const { error: updateError } = await supabase
        .from('seam_devices')
        .update({
          current_state: newState,
          updated_at: new Date().toISOString()
        })
        .eq('id', deviceId);

      if (updateError) {
        console.error('Error updating device state:', updateError);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Successfully executed ${action} on device`,
      result: seamResult
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in seam-device-control function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});