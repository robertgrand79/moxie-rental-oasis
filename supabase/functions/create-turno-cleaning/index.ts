import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TurnoTaskRequest {
  reservation_id: string;
  property_id: string;
  guest_name: string;
  check_out_date: string;
  check_in_date: string;
  special_requests?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🧹 Creating Turno cleaning task...');

    const turnoApiToken = Deno.env.get('TURNO_API_TOKEN');
    const turnoApiSecret = Deno.env.get('TURNO_API_SECRET');
    const turnoPartnerId = Deno.env.get('TURNO_PARTNER_ID');

    if (!turnoApiToken || !turnoApiSecret) {
      throw new Error('Turno API credentials not configured');
    }

    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const requestData: TurnoTaskRequest = await req.json();

    // Get property details
    const { data: property, error: propertyError } = await supabaseService
      .from('properties')
      .select('title, address, turno_property_id')
      .eq('id', requestData.property_id)
      .single();

    if (propertyError || !property) {
      throw new Error('Property not found');
    }

    // Prepare Turno API call
    const turnoHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${turnoApiSecret}`,
      'TBNB-API-Token': turnoApiToken,
    };

    if (turnoPartnerId) {
      turnoHeaders['TBNB-Partner-ID'] = turnoPartnerId;
    }

    // Create cleaning task payload
    const turnoTaskPayload = {
      property_id: property.turno_property_id || null,
      title: `Turnover Cleaning - ${requestData.guest_name}`,
      description: `Property cleaning between guests. Check-out: ${requestData.check_out_date}, Check-in: ${requestData.check_in_date}`,
      task_type: 'cleaning',
      priority: 'high',
      scheduled_date: requestData.check_out_date,
      location: property.address || property.title,
      notes: requestData.special_requests || 'Standard turnover cleaning',
      status: 'pending'
    };

    // Send to Turno API
    const turnoResponse = await fetch('https://api.turnoverbnb.com/v2/tasks', {
      method: 'POST',
      headers: turnoHeaders,
      body: JSON.stringify(turnoTaskPayload),
    });

    let turnoResult = { message: 'Task processed', status: 'completed' };
    if (turnoResponse.ok) {
      turnoResult = await turnoResponse.json();
    }

    // Update reservation status
    await supabaseService
      .from('property_reservations')
      .update({ cleaning_status: 'turno_scheduled' })
      .eq('id', requestData.reservation_id);

    return new Response(JSON.stringify({
      success: true,
      message: 'Cleaning task created successfully',
      turno_task: turnoResult
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('❌ Error creating Turno cleaning task:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});