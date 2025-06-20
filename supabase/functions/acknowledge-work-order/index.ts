
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
    console.log('CORS preflight request received');
    return new Response(null, { headers: corsHeaders });
  }

  console.log('=== ACKNOWLEDGE WORK ORDER FUNCTION START ===');
  console.log('Request method:', req.method);
  console.log('Request URL:', req.url);
  console.log('Environment check - SUPABASE_URL:', Deno.env.get('SUPABASE_URL') ? 'Present' : 'Missing');
  console.log('Environment check - SERVICE_ROLE_KEY:', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ? 'Present' : 'Missing');

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    console.log('Token parameter:', token ? 'Present' : 'Missing');
    console.log('Token length:', token ? token.length : 0);

    if (!token) {
      console.log('ERROR: No token provided in URL');
      return new Response(getErrorPage('Invalid acknowledgement link - no token provided'), {
        headers: { 'Content-Type': 'text/html', ...corsHeaders },
        status: 400,
      });
    }

    console.log('Searching for token in database...');

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

    console.log('Database query result:', {
      found: !!tokenData,
      error: tokenError?.message || 'None'
    });

    if (tokenError || !tokenData) {
      console.error('Token lookup failed:', tokenError);
      return new Response(getErrorPage('Invalid or expired acknowledgement link'), {
        headers: { 'Content-Type': 'text/html', ...corsHeaders },
        status: 404,
      });
    }

    console.log('Token found - Work Order:', tokenData.work_order?.work_order_number);
    console.log('Token expires at:', tokenData.expires_at);
    console.log('Token already used:', !!tokenData.used_at);

    // Check if token is expired
    if (new Date(tokenData.expires_at) < new Date()) {
      console.log('ERROR: Token has expired');
      return new Response(getErrorPage('This acknowledgement link has expired'), {
        headers: { 'Content-Type': 'text/html', ...corsHeaders },
        status: 410,
      });
    }

    // Check if already used
    if (tokenData.used_at) {
      console.log('Token already used - showing success page');
      return new Response(getSuccessPage(tokenData.work_order, true), {
        headers: { 'Content-Type': 'text/html', ...corsHeaders },
      });
    }

    console.log('Processing acknowledgement - updating work order status...');

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
      return new Response(getErrorPage('Failed to acknowledge work order - database update failed'), {
        headers: { 'Content-Type': 'text/html', ...corsHeaders },
        status: 500,
      });
    }

    console.log('Work order status updated successfully');

    // Mark token as used
    const { error: tokenUpdateError } = await supabase
      .from('work_order_acknowledgement_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', tokenData.id);

    if (tokenUpdateError) {
      console.error('Error marking token as used:', tokenUpdateError);
      // Don't fail the request for this, just log it
    }

    console.log('=== ACKNOWLEDGEMENT COMPLETED SUCCESSFULLY ===');

    return new Response(getSuccessPage(tokenData.work_order, false), {
      headers: { 'Content-Type': 'text/html', ...corsHeaders },
    });

  } catch (error) {
    console.error('=== CRITICAL ERROR IN ACKNOWLEDGE FUNCTION ===');
    console.error('Error details:', error);
    console.error('Error stack:', error.stack);
    return new Response(getErrorPage('An unexpected error occurred - please contact support'), {
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
          line-height: 1.6;
        }
        .container {
          background: white;
          border-radius: 12px;
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
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          flex-wrap: wrap;
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
          border-radius: 4px;
        }
        .contact-info {
          text-align: center;
          margin-top: 30px;
          color: #6b7280;
          font-size: 14px;
        }
        .timestamp {
          font-size: 12px;
          color: #9ca3af;
          text-align: center;
          margin-top: 20px;
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
          <p><strong>Questions about this work order?</strong><br>
          Contact the property management team at<br>
          <strong>gabby@moxievacationrental.com</strong> or <strong>+1 541-255-1698</strong></p>
        </div>

        <div class="timestamp">
          Acknowledged on ${new Date().toLocaleString()}
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
          line-height: 1.6;
        }
        .container {
          background: white;
          border-radius: 12px;
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
        .contact-info {
          background: #f3f4f6;
          border-radius: 8px;
          padding: 20px;
          margin-top: 20px;
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
        
        <div class="contact-info">
          <p><strong>Need Help?</strong><br>
          Please contact the property management team:<br>
          <strong>gabby@moxievacationrental.com</strong><br>
          <strong>+1 541-255-1698</strong></p>
        </div>
      </div>
    </body>
    </html>
  `;
}
