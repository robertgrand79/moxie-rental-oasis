import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('Starting Seam device sync...');

    const { workspaceId, propertyId, organizationId } = await req.json();

    if (!workspaceId) {
      throw new Error('Workspace ID is required');
    }

    // Get SEAM API key - check organization first, then fall back to global secret
    let seamApiKey: string | null = null;
    let effectiveOrgId = organizationId;

    // If property provided but no org, look up org from property
    if (propertyId && !organizationId) {
      const { data: property } = await supabase
        .from('properties')
        .select('organization_id')
        .eq('id', propertyId)
        .single();
      effectiveOrgId = property?.organization_id;
    }

    // Try to get org-level API key
    if (effectiveOrgId) {
      const { data: org } = await supabase
        .from('organizations')
        .select('seam_api_key')
        .eq('id', effectiveOrgId)
        .single();
      seamApiKey = org?.seam_api_key;
      if (seamApiKey) {
        console.log('Using organization-level SEAM API key');
      }
    }

    // Fall back to global secret if no org key
    if (!seamApiKey) {
      seamApiKey = Deno.env.get('SEAM_API_KEY');
      if (seamApiKey) {
        console.log('Using global SEAM API key');
      }
    }

    if (!seamApiKey) {
      throw new Error('SEAM_API_KEY not configured for this organization');
    }

    // Fetch devices from Seam API
    const seamResponse = await fetch(`https://connect.getseam.com/devices/list`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${seamApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ workspace_id: workspaceId }),
    });

    if (!seamResponse.ok) {
      const errorText = await seamResponse.text();
      console.error('Seam API error:', errorText);
      throw new Error(`Seam API error: ${seamResponse.status} ${errorText}`);
    }

    const seamData = await seamResponse.json();
    console.log(`Found ${seamData.devices?.length || 0} devices in Seam workspace`);

    // Process each device
    for (const device of seamData.devices || []) {
      console.log(`Processing device: ${device.display_name} (${device.device_id})`);

      // Determine device type and brand
      let deviceType = 'unknown';
      let deviceBrand = device.device_type || 'unknown';

      if (device.device_type?.includes('lock') || device.capabilities?.includes('lock')) {
        deviceType = 'smart_lock';
      } else if (device.device_type?.includes('thermostat') || device.capabilities?.includes('thermostat')) {
        deviceType = 'thermostat';
      }

      if (device.manufacturer) {
        deviceBrand = device.manufacturer.toLowerCase();
      }

      // Prepare device data for upsert
      const deviceData = {
        seam_device_id: device.device_id,
        workspace_id: workspaceId,
        property_id: propertyId,
        device_type: deviceType,
        device_brand: deviceBrand,
        device_model: device.model || null,
        device_name: device.display_name || device.name,
        location: device.location || null,
        is_online: device.is_online || false,
        battery_level: device.battery?.level || null,
        battery_status: device.battery?.status || null,
        firmware_version: device.firmware_version || null,
        last_seen_at: device.last_seen_at ? new Date(device.last_seen_at).toISOString() : null,
        device_properties: device.properties || {},
        capabilities: device.capabilities || [],
        current_state: {
          locked: device.locked,
          temperature: device.temperature,
          ...device.state
        },
        updated_at: new Date().toISOString()
      };

      // Upsert device into database
      const { error: upsertError } = await supabase
        .from('seam_devices')
        .upsert(deviceData, { 
          onConflict: 'seam_device_id',
          ignoreDuplicates: false 
        });

      if (upsertError) {
        console.error(`Error upserting device ${device.device_id}:`, upsertError);
        throw upsertError;
      }

      // Log device sync event
      const { error: eventError } = await supabase
        .from('device_events')
        .insert({
          device_id: (await supabase
            .from('seam_devices')
            .select('id')
            .eq('seam_device_id', device.device_id)
            .single()).data?.id,
          event_type: 'device.synced',
          event_source: 'seam_sync',
          event_data: { sync_timestamp: new Date().toISOString() }
        });

      if (eventError) {
        console.error(`Error logging sync event for device ${device.device_id}:`, eventError);
      }
    }

    // Update workspace sync status
    const { error: workspaceError } = await supabase
      .from('seam_workspaces')
      .update({
        last_sync_at: new Date().toISOString(),
        sync_status: 'success'
      })
      .eq('workspace_id', workspaceId);

    if (workspaceError) {
      console.error('Error updating workspace sync status:', workspaceError);
    }

    console.log(`Successfully synced ${seamData.devices?.length || 0} devices`);

    return new Response(JSON.stringify({
      success: true,
      message: `Successfully synced ${seamData.devices?.length || 0} devices`,
      deviceCount: seamData.devices?.length || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in seam-sync function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});