import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { platform, event_type, data } = await req.json();
    
    console.log(`Received webhook from ${platform}:`, event_type);

    switch (platform) {
      case 'hospitable':
        await handleHospitableWebhook(event_type, data);
        break;
      case 'vrbo':
        await handleVrboWebhook(event_type, data);
        break;
      default:
        console.log(`Unknown platform: ${platform}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleHospitableWebhook(eventType: string, data: any) {
  console.log('Handling Hospitable webhook:', eventType);

  switch (eventType) {
    case 'reservation.created':
    case 'reservation.updated':
      await syncReservation(data, 'hospitable');
      break;
    case 'reservation.cancelled':
      await cancelReservation(data.reservation_id, 'hospitable');
      break;
    case 'availability.updated':
      await syncAvailability(data, 'hospitable');
      break;
  }
}

async function handleVrboWebhook(eventType: string, data: any) {
  console.log('Handling VRBO webhook:', eventType);

  switch (eventType) {
    case 'booking.created':
    case 'booking.updated':
      await syncReservation(data, 'vrbo');
      break;
    case 'booking.cancelled':
      await cancelReservation(data.booking_id, 'vrbo');
      break;
    case 'calendar.updated':
      await syncAvailability(data, 'vrbo');
      break;
  }
}

async function syncReservation(data: any, platform: string) {
  try {
    // Find the property by external ID
    const { data: properties, error: propertyError } = await supabase
      .from('properties')
      .select('id')
      .contains('external_property_ids', { [platform]: data.property_id });

    if (propertyError || !properties?.length) {
      console.error('Property not found for external ID:', data.property_id);
      return;
    }

    const propertyId = properties[0].id;

    // Prepare reservation data
    const reservationData = {
      property_id: propertyId,
      external_booking_id: data.reservation_id || data.booking_id,
      guest_name: data.guest_name || `${data.first_name} ${data.last_name}`,
      guest_email: data.guest_email || data.email,
      guest_phone: data.guest_phone || data.phone,
      check_in_date: data.check_in || data.start_date,
      check_out_date: data.check_out || data.end_date,
      guest_count: data.guest_count || data.adults + (data.children || 0),
      total_amount: data.total_amount || data.total_price,
      currency: data.currency || 'USD',
      booking_status: mapBookingStatus(data.status, platform),
      source_platform: platform,
      platform_data: data,
      updated_at: new Date().toISOString()
    };

    // Upsert reservation
    const { error: reservationError } = await supabase
      .from('reservations')
      .upsert(reservationData, {
        onConflict: 'external_booking_id,source_platform'
      });

    if (reservationError) {
      console.error('Error syncing reservation:', reservationError);
    } else {
      console.log('Successfully synced reservation:', reservationData.external_booking_id);
    }

    // Create availability block
    const { error: blockError } = await supabase
      .from('availability_blocks')
      .upsert({
        property_id: propertyId,
        start_date: reservationData.check_in_date,
        end_date: reservationData.check_out_date,
        block_type: 'booked',
        external_booking_id: reservationData.external_booking_id,
        source_platform: platform,
        guest_count: reservationData.guest_count,
        sync_status: 'synced'
      }, {
        onConflict: 'property_id,start_date,end_date,block_type'
      });

    if (blockError) {
      console.error('Error creating availability block:', blockError);
    }

  } catch (error) {
    console.error('Error in syncReservation:', error);
  }
}

async function cancelReservation(externalBookingId: string, platform: string) {
  try {
    // Update reservation status
    const { error: reservationError } = await supabase
      .from('reservations')
      .update({
        booking_status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('external_booking_id', externalBookingId)
      .eq('source_platform', platform);

    if (reservationError) {
      console.error('Error cancelling reservation:', reservationError);
    }

    // Remove availability block
    const { error: blockError } = await supabase
      .from('availability_blocks')
      .delete()
      .eq('external_booking_id', externalBookingId)
      .eq('source_platform', platform);

    if (blockError) {
      console.error('Error removing availability block:', blockError);
    }

  } catch (error) {
    console.error('Error in cancelReservation:', error);
  }
}

async function syncAvailability(data: any, platform: string) {
  try {
    // Find the property by external ID
    const { data: properties, error: propertyError } = await supabase
      .from('properties')
      .select('id')
      .contains('external_property_ids', { [platform]: data.property_id });

    if (propertyError || !properties?.length) {
      console.error('Property not found for external ID:', data.property_id);
      return;
    }

    const propertyId = properties[0].id;

    // Process availability blocks
    const availabilityBlocks = data.blocked_dates?.map((block: any) => ({
      property_id: propertyId,
      start_date: block.start_date,
      end_date: block.end_date,
      block_type: block.type || 'blocked',
      source_platform: platform,
      notes: block.reason,
      sync_status: 'synced'
    })) || [];

    if (availabilityBlocks.length > 0) {
      const { error: blockError } = await supabase
        .from('availability_blocks')
        .upsert(availabilityBlocks, {
          onConflict: 'property_id,start_date,end_date,block_type'
        });

      if (blockError) {
        console.error('Error syncing availability:', blockError);
      } else {
        console.log(`Synced ${availabilityBlocks.length} availability blocks`);
      }
    }

  } catch (error) {
    console.error('Error in syncAvailability:', error);
  }
}

function mapBookingStatus(status: string, platform: string): string {
  const statusMappings = {
    hospitable: {
      'confirmed': 'confirmed',
      'pending': 'pending',
      'cancelled': 'cancelled',
      'checked_in': 'active',
      'checked_out': 'completed'
    },
    vrbo: {
      'booked': 'confirmed',
      'pending': 'pending',
      'cancelled': 'cancelled',
      'active': 'active',
      'completed': 'completed'
    }
  };

  return statusMappings[platform]?.[status.toLowerCase()] || 'pending';
}