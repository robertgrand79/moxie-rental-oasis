
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
        headers: { 'Content-Type': 'text/html; charset=utf-8', ...corsHeaders },
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
        headers: { 'Content-Type': 'text/html; charset=utf-8', ...corsHeaders },
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
        headers: { 'Content-Type': 'text/html; charset=utf-8', ...corsHeaders },
        status: 410,
      });
    }

    // Check if already used
    if (tokenData.used_at) {
      console.log('Token already used - showing success page');
      return new Response(getSuccessPage(tokenData.work_order, true), {
        headers: { 'Content-Type': 'text/html; charset=utf-8', ...corsHeaders },
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
        headers: { 'Content-Type': 'text/html; charset=utf-8', ...corsHeaders },
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
      headers: { 'Content-Type': 'text/html; charset=utf-8', ...corsHeaders },
    });

  } catch (error) {
    console.error('=== CRITICAL ERROR IN ACKNOWLEDGE FUNCTION ===');
    console.error('Error details:', error);
    console.error('Error stack:', error.stack);
    return new Response(getErrorPage('An unexpected error occurred - please contact support'), {
      headers: { 'Content-Type': 'text/html; charset=utf-8', ...corsHeaders },
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
      <title>Work Order ${alreadyAcknowledged ? 'Previously ' : ''}Acknowledged - Moxie Vacation Rentals</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          line-height: 1.6;
          color: #1f2937;
        }
        
        .container {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 48px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          max-width: 600px;
          width: 100%;
          animation: slideUp 0.6s ease-out;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes checkmarkAnimation {
          0% {
            transform: scale(0) rotate(45deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.2) rotate(45deg);
            opacity: 1;
          }
          100% {
            transform: scale(1) rotate(45deg);
            opacity: 1;
          }
        }
        
        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
          }
          50% {
            box-shadow: 0 0 0 20px rgba(16, 185, 129, 0);
          }
        }
        
        .success-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #10b981, #059669);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 32px;
          position: relative;
          animation: pulseGlow 2s infinite;
        }
        
        .checkmark {
          color: white;
          font-size: 40px;
          font-weight: bold;
          animation: checkmarkAnimation 0.8s ease-out 0.3s both;
        }
        
        .brand-header {
          text-align: center;
          margin-bottom: 32px;
        }
        
        .brand-logo {
          font-size: 28px;
          font-weight: 700;
          background: linear-gradient(135deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 8px;
        }
        
        .brand-tagline {
          color: #6b7280;
          font-size: 14px;
          font-weight: 500;
        }
        
        h1 {
          color: #1f2937;
          text-align: center;
          margin-bottom: 16px;
          font-size: 32px;
          font-weight: 700;
          line-height: 1.2;
        }
        
        .subtitle {
          text-align: center;
          color: #6b7280;
          margin-bottom: 40px;
          font-size: 18px;
          font-weight: 400;
        }
        
        .work-order-details {
          background: linear-gradient(135deg, #f8fafc, #e2e8f0);
          border-radius: 16px;
          padding: 32px;
          margin: 32px 0;
          border: 1px solid #e5e7eb;
          position: relative;
          overflow: hidden;
        }
        
        .work-order-details::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(135deg, #667eea, #764ba2);
        }
        
        .details-title {
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .details-title::before {
          content: '📋';
          font-size: 20px;
        }
        
        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding: 12px 0;
          border-bottom: 1px solid rgba(229, 231, 235, 0.5);
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .detail-row:last-child {
          border-bottom: none;
          margin-bottom: 0;
        }
        
        .label {
          font-weight: 600;
          color: #374151;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .value {
          color: #1f2937;
          font-weight: 500;
          font-size: 16px;
        }
        
        .status-badge {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
        
        .next-steps {
          background: linear-gradient(135deg, #dbeafe, #bfdbfe);
          border-left: 6px solid #3b82f6;
          padding: 24px;
          margin: 32px 0;
          border-radius: 12px;
          position: relative;
        }
        
        .next-steps::before {
          content: '🚀';
          position: absolute;
          top: -8px;
          right: 20px;
          font-size: 24px;
        }
        
        .next-steps h4 {
          color: #1e40af;
          margin-bottom: 16px;
          font-size: 18px;
          font-weight: 600;
        }
        
        .next-steps ul {
          margin: 0;
          padding-left: 24px;
          color: #374151;
        }
        
        .next-steps li {
          margin-bottom: 8px;
          font-weight: 500;
        }
        
        .contact-info {
          background: linear-gradient(135deg, #1f2937, #374151);
          color: white;
          padding: 32px;
          border-radius: 16px;
          text-align: center;
          margin-top: 40px;
          position: relative;
          overflow: hidden;
        }
        
        .contact-info::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(103, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
          pointer-events: none;
        }
        
        .contact-info-content {
          position: relative;
          z-index: 1;
        }
        
        .contact-title {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 16px;
        }
        
        .contact-details {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 20px;
          margin: 20px 0;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .contact-item {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin: 12px 0;
          font-size: 16px;
          font-weight: 500;
        }
        
        .timestamp {
          background: rgba(255, 255, 255, 0.05);
          padding: 16px;
          border-radius: 8px;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.8);
          text-align: center;
          margin-top: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        @media (max-width: 640px) {
          .container {
            padding: 32px 24px;
            margin: 10px;
          }
          
          h1 {
            font-size: 28px;
          }
          
          .success-icon {
            width: 64px;
            height: 64px;
          }
          
          .checkmark {
            font-size: 32px;
          }
          
          .work-order-details {
            padding: 24px;
          }
          
          .detail-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }
          
          .contact-info {
            padding: 24px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="brand-header">
          <div class="brand-logo">Moxie Vacation Rentals</div>
          <div class="brand-tagline">Your Home Base for Living Like a Local</div>
        </div>
        
        <div class="success-icon">
          <span class="checkmark">✓</span>
        </div>
        
        <h1>${alreadyAcknowledged ? 'Work Order Previously Acknowledged' : 'Work Order Acknowledged Successfully'}</h1>
        
        <p class="subtitle">
          ${alreadyAcknowledged 
            ? 'This work order has already been acknowledged.' 
            : 'Thank you for confirming receipt of this work order.'
          }
        </p>

        <div class="work-order-details">
          <div class="details-title">Work Order Details</div>
          
          <div class="detail-row">
            <span class="label">Work Order #</span>
            <span class="value">${workOrder.work_order_number}</span>
          </div>
          
          <div class="detail-row">
            <span class="label">Title</span>
            <span class="value">${workOrder.title}</span>
          </div>
          
          <div class="detail-row">
            <span class="label">Status</span>
            <span class="status-badge">Acknowledged</span>
          </div>
          
          <div class="detail-row">
            <span class="label">Contractor</span>
            <span class="value">${workOrder.contractor?.name || 'Not assigned'}</span>
          </div>
        </div>

        ${!alreadyAcknowledged ? `
        <div class="next-steps">
          <h4>Next Steps</h4>
          <ul>
            <li>Review the work order details and requirements</li>
            <li>Contact the property manager if you have any questions</li>
            <li>Begin work according to the specified timeline</li>
            <li>Update the work order status when work is in progress</li>
          </ul>
        </div>
        ` : ''}

        <div class="contact-info">
          <div class="contact-info-content">
            <div class="contact-title">Questions about this work order?</div>
            <div class="contact-details">
              <div class="contact-item">
                <span>📞</span>
                <strong>+1 541-255-1698</strong>
              </div>
              <div class="contact-item">
                <span>✉️</span>
                <strong>gabby@moxievacationrental.com</strong>
              </div>
              <div class="contact-item">
                <span>📍</span>
                <strong>2472 Willamette St, Eugene, OR 97405</strong>
              </div>
            </div>
            
            <div class="timestamp">
              Acknowledged on ${new Date().toLocaleString()}
            </div>
          </div>
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
      <title>Acknowledgement Error - Moxie Vacation Rentals</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #fca5a5 0%, #f87171 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          line-height: 1.6;
          color: #1f2937;
        }
        
        .container {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 48px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          max-width: 600px;
          width: 100%;
          text-align: center;
          animation: slideUp 0.6s ease-out;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .error-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 32px;
        }
        
        .x-mark {
          color: white;
          font-size: 40px;
          font-weight: bold;
        }
        
        .brand-header {
          margin-bottom: 32px;
        }
        
        .brand-logo {
          font-size: 28px;
          font-weight: 700;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 8px;
        }
        
        .brand-tagline {
          color: #6b7280;
          font-size: 14px;
          font-weight: 500;
        }
        
        h1 {
          color: #1f2937;
          margin-bottom: 20px;
          font-size: 32px;
          font-weight: 700;
        }
        
        p {
          color: #6b7280;
          margin-bottom: 30px;
          font-size: 18px;
        }
        
        .contact-info {
          background: linear-gradient(135deg, #1f2937, #374151);
          color: white;
          padding: 32px;
          border-radius: 16px;
          margin-top: 32px;
          position: relative;
          overflow: hidden;
        }
        
        .contact-info::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.1));
          pointer-events: none;
        }
        
        .contact-info-content {
          position: relative;
          z-index: 1;
        }
        
        .contact-title {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 16px;
        }
        
        .contact-details {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 20px;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .contact-item {
          margin: 12px 0;
          font-size: 16px;
          font-weight: 500;
        }
        
        @media (max-width: 640px) {
          .container {
            padding: 32px 24px;
            margin: 10px;
          }
          
          h1 {
            font-size: 28px;
          }
          
          .error-icon {
            width: 64px;
            height: 64px;
          }
          
          .x-mark {
            font-size: 32px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="brand-header">
          <div class="brand-logo">Moxie Vacation Rentals</div>
          <div class="brand-tagline">Your Home Base for Living Like a Local</div>
        </div>
        
        <div class="error-icon">
          <span class="x-mark">✕</span>
        </div>
        
        <h1>Acknowledgement Failed</h1>
        <p>${message}</p>
        
        <div class="contact-info">
          <div class="contact-info-content">
            <div class="contact-title">Need Help?</div>
            <div class="contact-details">
              <div class="contact-item">📞 <strong>+1 541-255-1698</strong></div>
              <div class="contact-item">✉️ <strong>gabby@moxievacationrental.com</strong></div>
              <div class="contact-item">📍 <strong>2472 Willamette St, Eugene, OR 97405</strong></div>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}
