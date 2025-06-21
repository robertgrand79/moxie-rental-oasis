
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { generateWorkOrderEmailContent } from './emailTemplate.ts';
import { createAcknowledgementToken } from './tokenManager.ts';
import { sendWorkOrderEmail } from './emailService.ts';
import { fetchWorkOrderWithDetails, updateWorkOrderStatus } from './workOrderService.ts';

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

    console.log('Sending work order email for ID:', workOrderId);

    // Fetch work order details
    const workOrder = await fetchWorkOrderWithDetails(supabase, workOrderId);

    // Generate acknowledgement token and URL
    const { acknowledgementUrl } = await createAcknowledgementToken(supabase, workOrderId);

    // Generate email content
    const emailContent = generateWorkOrderEmailContent(workOrder, acknowledgementUrl);

    // Send email via SendGrid
    await sendWorkOrderEmail(workOrder, emailContent, Deno.env.get('SENDGRID_API_KEY') ?? '');

    // Update work order status if needed
    await updateWorkOrderStatus(supabase, workOrderId, workOrder.status);

    console.log('Work order email sent successfully');

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Work order email sent successfully',
      acknowledgementUrl 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in send-work-order-pdf function:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
