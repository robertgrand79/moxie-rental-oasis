
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { generateWorkOrderEmailContent } from './emailTemplate.ts';
import { sendWorkOrderEmail } from './emailService.ts';
import { fetchWorkOrderWithDetails, updateWorkOrderStatus } from './workOrderService.ts';
import { decryptApiKey, isEncrypted } from '../_shared/encryption.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { workOrderId } = await req.json();

    if (!workOrderId) {
      throw new Error('Work order ID is required');
    }

    console.log('Starting email send process for work order:', workOrderId);

    // Fetch work order details
    const workOrder = await fetchWorkOrderWithDetails(supabase, workOrderId);
    
    console.log('Fetched work order:', {
      id: workOrder.id,
      number: workOrder.work_order_number,
      title: workOrder.title,
      contractor: workOrder.contractor?.email
    });

    // Generate email content
    const emailContent = generateWorkOrderEmailContent(workOrder);
    
    console.log('Email content generated successfully, length:', emailContent.length);

    // Get Resend API key from organization
    let resendApiKey = '';
    
    if (workOrder.organization_id) {
      console.log('Fetching Resend API key for organization:', workOrder.organization_id);
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('resend_api_key')
        .eq('id', workOrder.organization_id)
        .single();

      if (orgError) {
        console.error('Error fetching organization:', orgError);
      }

      if (org?.resend_api_key) {
        resendApiKey = org.resend_api_key;
        console.log('Found Resend API key in organization settings');
        
        // Decrypt if encrypted
        if (isEncrypted(resendApiKey)) {
          console.log('Decrypting Resend API key');
          resendApiKey = await decryptApiKey(resendApiKey);
        }
      }
    }

    // Fall back to environment variable
    if (!resendApiKey) {
      console.log('No org key found, falling back to environment variable');
      resendApiKey = Deno.env.get('RESEND_API_KEY') || '';
    }

    if (!resendApiKey) {
      throw new Error('No Resend API key configured. Please add your Resend API key in Organization Settings > Communications.');
    }

    // Send email via Resend
    console.log('Sending email to contractor:', workOrder.contractor?.email);
    await sendWorkOrderEmail(workOrder, emailContent, resendApiKey);

    // Update work order status if needed
    await updateWorkOrderStatus(supabase, workOrderId, workOrder.status);

    console.log('Work order email sent successfully');

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Work order email sent successfully',
      workOrderNumber: workOrder.work_order_number,
      contractorEmail: workOrder.contractor?.email
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in send-work-order-pdf function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
