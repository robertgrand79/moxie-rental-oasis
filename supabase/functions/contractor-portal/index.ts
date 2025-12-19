import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    const token = url.searchParams.get('token');

    console.log('Contractor portal request:', { action, token: token?.substring(0, 8) + '...' });

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate token and get contractor
    const { data: tokenData, error: tokenError } = await supabase
      .from('contractor_access_tokens')
      .select(`
        id,
        contractor_id,
        is_active,
        contractors (
          id,
          name,
          email,
          company_name,
          organization_id
        )
      `)
      .eq('token', token)
      .eq('is_active', true)
      .single();

    if (tokenError || !tokenData) {
      console.error('Token validation failed:', tokenError);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const contractor = tokenData.contractors;
    console.log('Validated contractor:', contractor.name);

    // Update last accessed
    await supabase
      .from('contractor_access_tokens')
      .update({ last_accessed_at: new Date().toISOString() })
      .eq('id', tokenData.id);

    // Handle different actions
    if (action === 'get-work-orders' || req.method === 'GET') {
      // Fetch work orders assigned to this contractor
      const { data: workOrders, error: woError } = await supabase
        .from('work_orders')
        .select(`
          id,
          work_order_number,
          title,
          description,
          priority,
          status,
          estimated_completion_date,
          access_code,
          scope_of_work,
          special_instructions,
          acknowledged_at,
          completed_at,
          completion_photos,
          contractor_notes,
          created_at,
          properties (
            id,
            title,
            location,
            city
          )
        `)
        .eq('contractor_id', contractor.id)
        .in('status', ['sent', 'acknowledged', 'in_progress', 'completed', 'invoiced'])
        .order('created_at', { ascending: false });

      if (woError) {
        console.error('Error fetching work orders:', woError);
        throw woError;
      }

      return new Response(
        JSON.stringify({ 
          contractor: {
            id: contractor.id,
            name: contractor.name,
            email: contractor.email,
            company_name: contractor.company_name
          },
          workOrders: workOrders || []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'update-status' && req.method === 'POST') {
      const body = await req.json();
      const { workOrderId, status, notes } = body;

      if (!workOrderId || !status) {
        return new Response(
          JSON.stringify({ error: 'workOrderId and status are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify this work order belongs to this contractor
      const { data: wo, error: woCheckError } = await supabase
        .from('work_orders')
        .select('id, contractor_id')
        .eq('id', workOrderId)
        .eq('contractor_id', contractor.id)
        .single();

      if (woCheckError || !wo) {
        return new Response(
          JSON.stringify({ error: 'Work order not found or not assigned to you' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Build update object
      const updateData: Record<string, unknown> = { status };
      
      if (status === 'acknowledged' && !wo.acknowledged_at) {
        updateData.acknowledged_at = new Date().toISOString();
      } else if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }

      if (notes) {
        updateData.contractor_notes = notes;
      }

      const { error: updateError } = await supabase
        .from('work_orders')
        .update(updateData)
        .eq('id', workOrderId);

      if (updateError) {
        console.error('Error updating work order:', updateError);
        throw updateError;
      }

      console.log(`Work order ${workOrderId} updated to status: ${status}`);

      return new Response(
        JSON.stringify({ success: true, message: `Status updated to ${status}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'upload-photo' && req.method === 'POST') {
      const formData = await req.formData();
      const file = formData.get('file') as File;
      const workOrderId = formData.get('workOrderId') as string;

      if (!file || !workOrderId) {
        return new Response(
          JSON.stringify({ error: 'file and workOrderId are required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Verify work order belongs to contractor
      const { data: wo, error: woCheckError } = await supabase
        .from('work_orders')
        .select('id, completion_photos')
        .eq('id', workOrderId)
        .eq('contractor_id', contractor.id)
        .single();

      if (woCheckError || !wo) {
        return new Response(
          JSON.stringify({ error: 'Work order not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Upload to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${workOrderId}/${Date.now()}.${fileExt}`;
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('work-order-files')
        .upload(fileName, uint8Array, {
          contentType: file.type,
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('work-order-files')
        .getPublicUrl(fileName);

      const photoUrl = publicUrlData.publicUrl;

      // Update work order with new photo
      const existingPhotos = wo.completion_photos || [];
      const { error: updateError } = await supabase
        .from('work_orders')
        .update({ 
          completion_photos: [...existingPhotos, photoUrl] 
        })
        .eq('id', workOrderId);

      if (updateError) {
        console.error('Error updating photos:', updateError);
        throw updateError;
      }

      console.log(`Photo uploaded for work order ${workOrderId}`);

      return new Response(
        JSON.stringify({ success: true, url: photoUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Contractor portal error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});