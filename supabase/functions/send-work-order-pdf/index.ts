
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { generateWorkOrderEmailContent } from './emailTemplate.ts';
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

    console.log('🐛 DEBUG: Starting email send process for work order:', workOrderId);
    console.log('🐛 DEBUG: Function deployment timestamp:', new Date().toISOString());

    // Fetch work order details
    const workOrder = await fetchWorkOrderWithDetails(supabase, workOrderId);
    
    console.log('🐛 DEBUG: Fetched work order data:', {
      id: workOrder.id,
      number: workOrder.work_order_number,
      title: workOrder.title,
      contractor: workOrder.contractor?.email,
      status: workOrder.status
    });

    // Generate email content
    console.log('🐛 DEBUG: About to generate email content using template v3.1.0-debug');
    const emailContent = generateWorkOrderEmailContent(workOrder);
    
    console.log('🐛 DEBUG: Email content generated, length:', emailContent.length);
    console.log('🐛 DEBUG: Email content contains "Acknowledge Work Order":', emailContent.includes('Acknowledge Work Order'));
    console.log('🐛 DEBUG: Email content contains debug info:', emailContent.includes('DEBUG INFO'));

    // Send email via SendGrid
    console.log('🐛 DEBUG: About to send email via SendGrid to:', workOrder.contractor?.email);
    await sendWorkOrderEmail(workOrder, emailContent, Deno.env.get('SENDGRID_API_KEY') ?? '');

    // Update work order status if needed
    await updateWorkOrderStatus(supabase, workOrderId, workOrder.status);

    console.log('🐛 DEBUG: Work order email sent successfully');
    console.log('🐛 DEBUG: Email should contain template version v3.1.0-debug and debug section');

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Work order email sent successfully',
      debug: {
        templateVersion: 'v3.1.0-debug',
        workOrderId: workOrderId,
        timestamp: new Date().toISOString(),
        emailLength: emailContent.length,
        containsAcknowledgeButton: emailContent.includes('Acknowledge Work Order'),
        containsDebugInfo: emailContent.includes('DEBUG INFO')
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('🐛 DEBUG: Error in send-work-order-pdf function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      debug: {
        timestamp: new Date().toISOString(),
        functionVersion: 'v3.1.0-debug'
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
