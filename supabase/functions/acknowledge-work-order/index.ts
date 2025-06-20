
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return new Response(getErrorPage('Invalid acknowledgement link'), {
        headers: { 'Content-Type': 'text/html', ...corsHeaders },
        status: 400,
      });
    }

    console.log('Processing acknowledgement for token:', token);

    // Get the acknowledgement token and work order details
    const { data: tokenData, error: tokenError } = await supabase
      .from('work_order_acknowledgement_tokens')
      .select(`
        *,
        work_order:work_orders(
          id,
          work_order_number,
          title,
          status,
          contractor:contractors(name, email)
        )
      `)
      .eq('token', token)
      .single();

    if (tokenError || !tokenData) {
      console.error('Token not found:', tokenError);
      return new Response(getErrorPage('Invalid or expired acknowledgement link'), {
        headers: { 'Content-Type': 'text/html', ...corsHeaders },
        status: 404,
      });
    }

    // Check if token is expired
    if (new Date(tokenData.expires_at) < new Date()) {
      return new Response(getErrorPage('This acknowledgement link has expired'), {
        headers: { 'Content-Type': 'text/html', ...corsHeaders },
        status: 410,
      });
    }

    // Check if already used
    if (tokenData.used_at) {
      return new Response(getSuccessPage(tokenData.work_order, true), {
        headers: { 'Content-Type': 'text/html', ...corsHeaders },
      });
    }

    // Update work order status to acknowledged
    const { error: updateError } = await supabase
      .from('work_orders')
      .update({
        status: 'acknowledged',
        acknowledged_at: new Date().toISOString()
      })
      .eq('id', tokenData.work_order_id);

    if (updateError) {
      console.error('Error updating work order:', updateError);
      return new Response(getErrorPage('Failed to acknowledge work order'), {
        headers: { 'Content-Type': 'text/html', ...corsHeaders },
        status: 500,
      });
    }

    // Mark token as used
    await supabase
      .from('work_order_acknowledgement_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', tokenData.id);

    console.log('Work order acknowledged successfully:', tokenData.work_order_id);

    return new Response(getSuccessPage(tokenData.work_order, false), {
      headers: { 'Content-Type': 'text/html', ...corsHeaders },
    });

  } catch (error) {
    console.error('Error in acknowledge-work-order function:', error);
    return new Response(getErrorPage('An unexpected error occurred'), {
      headers: { 'Content-Type': 'text/html', ...corsHeaders },
      status: 500,
    });
  }
});

function getSuccessPage(workOrder: any, alreadyAcknowledged: boolean) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Work Order ${alreadyAcknowledged ? 'Previously ' : ''}Acknowledged</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8fafc;
        }
        .container {
          background: white;
          border-radius: 8px;
          padding: 40px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .success-icon {
          width: 64px;
          height: 64px;
          background: #10b981;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
        }
        .checkmark {
          color: white;
          font-size: 32px;
        }
        h1 {
          color: #1f2937;
          text-align: center;
          margin-bottom: 20px;
        }
        .work-order-details {
          background: #f3f4f6;
          border-radius: 6px;
          padding: 20px;
          margin: 20px 0;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        .label {
          font-weight: 600;
          color: #374151;
        }
        .value {
          color: #6b7280;
        }
        .next-steps {
          background: #eff6ff;
          border-left: 4px solid #3b82f6;
          padding: 16px;
          margin: 20px 0;
        }
        .contact-info {
          text-align: center;
          margin-top: 30px;
          color: #6b7280;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="success-icon">
          <span class="checkmark">✓</span>
        </div>
        
        <h1>${alreadyAcknowledged ? 'Work Order Previously Acknowledged' : 'Work Order Acknowledged Successfully'}</h1>
        
        <p style="text-align: center; color: #6b7280; margin-bottom: 30px;">
          ${alreadyAcknowledged 
            ? 'This work order has already been acknowledged.' 
            : 'Thank you for confirming receipt of this work order.'
          }
        </p>

        <div class="work-order-details">
          <h3 style="margin-top: 0; color: #1f2937;">Work Order Details</h3>
          <div class="detail-row">
            <span class="label">Work Order #:</span>
            <span class="value">${workOrder.work_order_number}</span>
          </div>
          <div class="detail-row">
            <span class="label">Title:</span>
            <span class="value">${workOrder.title}</span>
          </div>
          <div class="detail-row">
            <span class="label">Status:</span>
            <span class="value">Acknowledged</span>
          </div>
          <div class="detail-row">
            <span class="label">Contractor:</span>
            <span class="value">${workOrder.contractor?.name || 'Not assigned'}</span>
          </div>
        </div>

        ${!alreadyAcknowledged ? `
        <div class="next-steps">
          <h4 style="margin-top: 0; color: #1e40af;">Next Steps</h4>
          <ul style="margin: 0; padding-left: 20px; color: #374151;">
            <li>Review the work order details and requirements</li>
            <li>Contact the property manager if you have any questions</li>
            <li>Begin work according to the specified timeline</li>
            <li>Update the work order status when work is in progress</li>
          </ul>
        </div>
        ` : ''}

        <div class="contact-info">
          <p>If you have any questions about this work order,<br>
          please contact the property management team.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getErrorPage(message: string) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Acknowledgement Error</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8fafc;
        }
        .container {
          background: white;
          border-radius: 8px;
          padding: 40px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          text-align: center;
        }
        .error-icon {
          width: 64px;
          height: 64px;
          background: #ef4444;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
        }
        .x-mark {
          color: white;
          font-size: 32px;
        }
        h1 {
          color: #1f2937;
          margin-bottom: 20px;
        }
        p {
          color: #6b7280;
          margin-bottom: 30px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="error-icon">
          <span class="x-mark">✕</span>
        </div>
        
        <h1>Acknowledgement Failed</h1>
        <p>${message}</p>
        <p>Please contact the property management team for assistance.</p>
      </div>
    </body>
    </html>
  `;
}
