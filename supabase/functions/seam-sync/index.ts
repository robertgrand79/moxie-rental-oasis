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

    let effectiveOrgId = organizationId;

    if (propertyId && !organizationId) {
      const { data: property } = await supabase
        .from('properties')
        .select('organization_id')
        .eq('id', propertyId)
        .single();
      effectiveOrgId = property?.organization_id;
    }

    if (!effectiveOrgId) {
      throw new Error('Organization is required for Seam sync');
    }

    const { data: org } = await supabase
      .from('organizations')
      .select('seam_api_key')
      .eq('id', effectiveOrgId)
      .single();

    const seamApiKey = org?.seam_api_key;

    if (!seamApiKey) {
      throw new Error('This organization must connect its own Seam API key before syncing devices.');
    }

    console.log('Using organization-owned SEAM API key');

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

    for (const device of seamData.devices || []) {
      console.log(`Processing device: ${device.display_name} (${device.device_id})`);

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
          ...device.state,
        },
        updated_at: new Date().toISOString(),
      };

      const { error: upsertError } = await supabase
        .from('seam_devices')
        .upsert(deviceData, {
          onConflict: 'seam_device_id',
          ignoreDuplicates: false,
        });

      if (upsertError) {
        console.error(`Error upserting device ${device.device_id}:`, upsertError);
        throw upsertError;
      }

      const { data: syncedDevice } = await supabase
        .from('seam_devices')
        .select('id')
        .eq('seam_device_id', device.device_id)
        .single();

      const { error: eventError } = await supabase
        .from('device_events')
        .insert({
          device_id: syncedDevice?.id,
          event_type: 'device.synced',
          event_source: 'seam_sync',
          event_data: { sync_timestamp: new Date().toISOString() },
        });

      if (eventError) {
        console.error(`Error logging sync event for device ${device.device_id}:`, eventError);
      }
    }

    if (propertyId) {
      const { data: smartLocks, error: smartLockError } = await supabase
        .from('seam_devices')
        .select('id, device_name, is_primary_lock')
        .eq('property_id', propertyId)
        .eq('device_type', 'smart_lock')
        .order('device_name');

      if (smartLockError) {
        console.error('Error loading smart locks after sync:', smartLockError);
      } else if ((smartLocks || []).length > 0) {
        const existingPrimaryLock = smartLocks?.find((device) => device.is_primary_lock);
        if (!existingPrimaryLock) {
          const defaultPrimaryLock = smartLocks?.[0];
          if (defaultPrimaryLock) {
            const { error: primaryLockError } = await supabase
              .from('seam_devices')
              .update({ is_primary_lock: true })
              .eq('id', defaultPrimaryLock.id);

            if (primaryLockError) {
              console.error('Error assigning default primary smart lock:', primaryLockError);
            } else {
              console.log(`Assigned default primary smart lock: ${defaultPrimaryLock.device_name}`);
            }
          }
        }
      }
    }

    const { error: workspaceError } = await supabase
      .from('seam_workspaces')
      .update({
        last_sync_at: new Date().toISOString(),
        sync_status: 'success',
      })
      .eq('workspace_id', workspaceId);

    if (workspaceError) {
      console.error('Error updating workspace sync status:', workspaceError);
    }

    console.log(`Successfully synced ${seamData.devices?.length || 0} devices`);

    return new Response(JSON.stringify({
      success: true,
      message: `Successfully synced ${seamData.devices?.length || 0} devices`,
      deviceCount: seamData.devices?.length || 0,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in seam-sync function:', error);
    return new Response(JSON.stringify({
      error: error.message,
      success: false,
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});