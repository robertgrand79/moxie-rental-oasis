import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, seam-signature',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const seamWebhookSecret = Deno.env.get('SEAM_WEBHOOK_SECRET')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify webhook signature
    const signature = req.headers.get('seam-signature');
    const body = await req.text();
    
    const isValid = await verifyWebhookSignature(signature, body, seamWebhookSecret);
    if (!isValid) {
      console.error('Invalid webhook signature - signature:', signature?.substring(0, 20) + '...');
      return new Response('Invalid signature', { status: 401 });
    }

    const webhookData = JSON.parse(body);
    console.log('Received Seam webhook:', webhookData.event_type, webhookData.device_id);

    // Find the device in our database
    const { data: device, error: deviceError } = await supabase
      .from('seam_devices')
      .select('*')
      .eq('seam_device_id', webhookData.device_id)
      .maybeSingle();

    if (deviceError) {
      console.error('Error finding device:', deviceError);
      return new Response('Error finding device', { status: 500 });
    }

    if (!device) {
      console.log(`Device ${webhookData.device_id} not found in our database, skipping`);
      return new Response('OK', { status: 200 });
    }

    // Process the webhook event
    await processWebhookEvent(supabase, device, webhookData);

    return new Response('OK', { status: 200 });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response('Error processing webhook', { status: 500 });
  }
});

async function verifyWebhookSignature(
  signature: string | null, 
  body: string, 
  secret: string
): Promise<boolean> {
  if (!signature) {
    console.warn('Missing webhook signature');
    return false;
  }

  if (!secret) {
    console.warn('Missing SEAM_WEBHOOK_SECRET - skipping verification in development');
    return true; // Allow in development without secret
  }

  try {
    const encoder = new TextEncoder();
    
    // Import the secret key for HMAC-SHA256
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    // Compute the expected signature
    const signatureBuffer = await crypto.subtle.sign(
      'HMAC', 
      key, 
      encoder.encode(body)
    );
    
    // Convert to hex string
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    // Extract actual signature (handle 'sha256=' prefix if present)
    const actualSignature = signature.replace(/^sha256=/, '').toLowerCase();
    
    // Compare signatures
    if (actualSignature.length !== expectedSignature.length) {
      console.error('Signature length mismatch');
      return false;
    }
    
    // Constant-time comparison to prevent timing attacks
    let result = 0;
    for (let i = 0; i < actualSignature.length; i++) {
      result |= actualSignature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
    }
    
    return result === 0;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

async function processWebhookEvent(supabase: any, device: any, webhookData: any) {
  const { event_type, device_id, occurred_at } = webhookData;

  // Log the event
  const { error: eventError } = await supabase
    .from('device_events')
    .insert({
      device_id: device.id,
      event_type,
      event_source: 'seam_webhook',
      event_data: webhookData,
      occurred_at: occurred_at || new Date().toISOString()
    });

  if (eventError) {
    console.error('Error logging device event:', eventError);
  }

  // Update device state based on event type
  let stateUpdate: any = {};

  switch (event_type) {
    case 'lock.locked':
      stateUpdate.current_state = { ...device.current_state, locked: true };
      break;
    
    case 'lock.unlocked':
      stateUpdate.current_state = { ...device.current_state, locked: false };
      break;
    
    case 'device.connected':
      stateUpdate.is_online = true;
      stateUpdate.last_seen_at = new Date().toISOString();
      break;
    
    case 'device.disconnected':
      stateUpdate.is_online = false;
      break;
    
    case 'device.battery.low':
      if (webhookData.battery) {
        stateUpdate.battery_level = webhookData.battery.level;
        stateUpdate.battery_status = 'low';
        
        // Create maintenance alert for low battery
        await createMaintenanceAlert(supabase, device.id, 'low_battery', 
          `Low battery detected: ${webhookData.battery.level}%`);
      }
      break;
    
    case 'thermostat.temperature_changed':
      if (webhookData.temperature !== undefined) {
        stateUpdate.current_state = { 
          ...device.current_state, 
          temperature: webhookData.temperature 
        };
      }
      break;

    case 'access_code.used':
      // Track access code usage
      if (webhookData.access_code_id) {
        await trackAccessCodeUsage(supabase, webhookData.access_code_id, device.id);
      }
      break;
  }

  // Update device if we have state changes
  if (Object.keys(stateUpdate).length > 0) {
    stateUpdate.updated_at = new Date().toISOString();
    
    const { error: updateError } = await supabase
      .from('seam_devices')
      .update(stateUpdate)
      .eq('id', device.id);

    if (updateError) {
      console.error('Error updating device state:', updateError);
    }
  }

  console.log(`Processed ${event_type} event for device ${device.device_name}`);
}

async function createMaintenanceAlert(supabase: any, deviceId: string, alertType: string, message: string) {
  const { error } = await supabase
    .from('device_maintenance_alerts')
    .insert({
      device_id: deviceId,
      alert_type: alertType,
      severity: alertType === 'low_battery' ? 'medium' : 'high',
      message,
      is_resolved: false
    });

  if (error) {
    console.error('Error creating maintenance alert:', error);
  }
}

async function trackAccessCodeUsage(supabase: any, seamAccessCodeId: string, deviceId: string) {
  // Find our access code record
  const { data: accessCode, error: findError } = await supabase
    .from('seam_access_codes')
    .select('*')
    .eq('seam_access_code_id', seamAccessCodeId)
    .maybeSingle();

  if (findError || !accessCode) {
    console.log('Access code not found in our database:', seamAccessCodeId);
    return;
  }

  // Increment usage count
  const { error: updateError } = await supabase
    .from('seam_access_codes')
    .update({ 
      usage_count: (accessCode.usage_count || 0) + 1,
      updated_at: new Date().toISOString()
    })
    .eq('id', accessCode.id);

  if (updateError) {
    console.error('Error updating access code usage:', updateError);
  }
}