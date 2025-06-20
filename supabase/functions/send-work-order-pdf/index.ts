
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendGridEmail {
  personalizations: Array<{
    to: Array<{ email: string; name?: string }>;
    subject: string;
  }>;
  from: {
    email: string;
    name: string;
  };
  content: Array<{
    type: string;
    value: string;
  }>;
}

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

    // Fetch work order details with related data (removed problematic profile join)
    const { data: workOrder, error: fetchError } = await supabase
      .from('work_orders')
      .select(`
        *,
        contractor:contractors(*),
        property:properties(*)
      `)
      .eq('id', workOrderId)
      .single();

    if (fetchError || !workOrder) {
      console.error('Work order not found:', fetchError);
      throw new Error('Work order not found');
    }

    if (!workOrder.contractor?.email) {
      throw new Error('No contractor email found for this work order');
    }

    // Generate acknowledgement token
    const token = generateSecureToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const { error: tokenError } = await supabase
      .from('work_order_acknowledgement_tokens')
      .insert({
        work_order_id: workOrderId,
        token,
        expires_at: expiresAt.toISOString(),
      });

    if (tokenError) {
      console.error('Error creating acknowledgement token:', tokenError);
      throw new Error('Failed to create acknowledgement token');
    }

    const acknowledgementUrl = `https://joiovubyokikqjytxtuv.supabase.co/functions/v1/acknowledge-work-order?token=${encodeURIComponent(token)}`;

    // Generate email content
    const emailContent = generateWorkOrderEmailContent(workOrder, acknowledgementUrl);

    // Prepare SendGrid email
    const emailData: SendGridEmail = {
      personalizations: [{
        to: [{ 
          email: workOrder.contractor.email, 
          name: workOrder.contractor.name 
        }],
        subject: `New Work Order: ${workOrder.work_order_number} - ${workOrder.title}`
      }],
      from: {
        email: 'team@moxievacationrentals.com',
        name: 'Moxie Vacation Rentals'
      },
      content: [{
        type: 'text/html',
        value: emailContent
      }]
    };

    // Send email via SendGrid
    const sendGridResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SENDGRID_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    if (!sendGridResponse.ok) {
      const errorText = await sendGridResponse.text();
      console.error('SendGrid error:', errorText);
      throw new Error(`Failed to send email: ${sendGridResponse.status}`);
    }

    // Update work order status to 'sent' if it was 'draft'
    if (workOrder.status === 'draft') {
      const { error: updateError } = await supabase
        .from('work_orders')
        .update({ 
          status: 'sent',
          sent_at: new Date().toISOString()
        })
        .eq('id', workOrderId);

      if (updateError) {
        console.error('Error updating work order status:', updateError);
      }
    }

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

function generateSecureToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

function generateWorkOrderEmailContent(workOrder: any, acknowledgementUrl: string): string {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const priorityColors = {
    low: '#10b981',
    medium: '#f59e0b', 
    high: '#f97316',
    critical: '#ef4444'
  };

  const priorityColor = priorityColors[workOrder.priority as keyof typeof priorityColors] || '#6b7280';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Work Order Assignment</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #1f2937;
          margin: 0;
          padding: 0;
          background: #f8fafc;
          min-height: 100vh;
        }
        
        .email-container {
          max-width: 650px;
          margin: 20px auto;
          background: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
        }
        
        .header {
          background: #ffffff;
          color: #1f2937;
          padding: 40px 30px;
          text-align: center;
          border-bottom: 3px solid #3b82f6;
        }
        
        .logo {
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 8px;
          letter-spacing: -0.025em;
          color: #1f2937;
        }
        
        .tagline {
          font-size: 16px;
          color: #6b7280;
          margin-bottom: 20px;
          font-weight: 400;
        }
        
        .work-order-badge {
          display: inline-block;
          background: #f3f4f6;
          padding: 12px 24px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 18px;
          border: 2px solid #3b82f6;
          color: #1f2937;
          margin-top: 10px;
        }
        
        .content {
          padding: 40px 30px;
          background: #ffffff;
        }
        
        .greeting {
          font-size: 24px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 16px;
          text-align: center;
        }
        
        .intro-text {
          font-size: 18px;
          color: #4b5563;
          text-align: center;
          margin-bottom: 40px;
          line-height: 1.7;
        }
        
        .acknowledge-card {
          background: #ffffff;
          border: 2px solid #3b82f6;
          border-radius: 16px;
          padding: 32px;
          text-align: center;
          margin: 0 0 40px 0;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }
        
        .acknowledge-title {
          font-size: 20px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 12px;
        }
        
        .acknowledge-subtitle {
          color: #4b5563;
          margin-bottom: 24px;
          font-size: 16px;
          line-height: 1.6;
        }
        
        .acknowledge-button {
          display: inline-block;
          background: #3b82f6;
          color: white;
          text-decoration: none;
          padding: 16px 32px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          transition: all 0.3s ease;
          box-shadow: 0 2px 4px 0 rgba(59, 130, 246, 0.2);
          border: none;
        }
        
        .acknowledge-button:hover {
          background: #2563eb;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px 0 rgba(59, 130, 246, 0.3);
        }
        
        .work-order-details {
          background: #f8fafc;
          border-radius: 12px;
          padding: 30px;
          margin: 30px 0;
          border: 1px solid #e2e8f0;
        }
        
        .details-title {
          font-size: 22px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .details-title::before {
          content: '📋';
          font-size: 20px;
        }
        
        .details-grid {
          display: grid;
          gap: 20px;
        }
        
        .detail-item {
          background: white;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }
        
        .detail-label {
          font-weight: 600;
          color: #6b7280;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .detail-value {
          color: #1f2937;
          font-size: 16px;
          font-weight: 500;
        }
        
        .priority-badge {
          display: inline-block;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          text-transform: capitalize;
          color: white;
          background: ${priorityColor};
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }
        
        .description-section {
          background: #fffbeb;
          border-left: 4px solid #f59e0b;
          padding: 24px;
          margin: 24px 0;
          border-radius: 8px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
        
        .contact-section {
          background: #f8fafc;
          color: #1f2937;
          padding: 40px 30px;
          text-align: center;
          margin-top: 40px;
          border-top: 1px solid #e2e8f0;
        }
        
        .contact-title {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 16px;
          color: #1f2937;
        }
        
        .contact-info {
          background: #ffffff;
          border-radius: 12px;
          padding: 24px;
          margin: 24px 0;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }
        
        .contact-detail {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin: 12px 0;
          font-size: 16px;
          color: #1f2937;
        }
        
        .contact-detail strong {
          font-weight: 600;
          color: #1f2937;
        }
        
        .contact-detail a {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 600;
        }
        
        .contact-detail a:hover {
          color: #2563eb;
          text-decoration: underline;
        }
        
        .footer-note {
          font-size: 14px;
          color: #6b7280;
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid #e2e8f0;
        }
        
        @media (max-width: 600px) {
          .email-container {
            margin: 10px;
            border-radius: 12px;
          }
          
          .header {
            padding: 30px 20px;
          }
          
          .content {
            padding: 30px 20px;
          }
          
          .acknowledge-card {
            padding: 24px;
          }
          
          .work-order-details {
            padding: 20px;
          }
          
          .contact-section {
            padding: 30px 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <div class="logo">Moxie Vacation Rentals</div>
          <div class="tagline">Your Home Base for Living Like a Local</div>
          <div class="work-order-badge">${workOrder.work_order_number}</div>
        </div>
        
        <div class="content">
          <div class="greeting">Hello ${workOrder.contractor?.name || 'Contractor'}!</div>
          <div class="intro-text">
            We have a new work order ready for you. Please review the details below and acknowledge receipt to get started.
          </div>

          <div class="acknowledge-card">
            <div class="acknowledge-title">Action Required</div>
            <div class="acknowledge-subtitle">
              Please confirm you've received this work order by clicking the button below. This helps us track project progress and ensures clear communication.
            </div>
            <a href="${acknowledgementUrl}" class="acknowledge-button">
              ✓ Acknowledge Work Order
            </a>
          </div>

          <div class="work-order-details">
            <div class="details-title">Work Order Details</div>
            
            <div class="details-grid">
              <div class="detail-item">
                <div class="detail-label">📝 Title</div>
                <div class="detail-value">${workOrder.title}</div>
              </div>
              
              <div class="detail-item">
                <div class="detail-label">⚡ Priority</div>
                <span class="priority-badge">${workOrder.priority}</span>
              </div>
              
              ${workOrder.property ? `
              <div class="detail-item">
                <div class="detail-label">🏠 Property</div>
                <div class="detail-value">
                  ${workOrder.property.title}<br>
                  <span style="color: #6b7280; font-size: 14px; font-weight: 400;">${workOrder.property.location}</span>
                </div>
              </div>
              ` : ''}
              
              ${workOrder.estimated_completion_date ? `
              <div class="detail-item">
                <div class="detail-label">📅 Due Date</div>
                <div class="detail-value">${formatDate(workOrder.estimated_completion_date)}</div>
              </div>
              ` : ''}
              
              ${workOrder.access_code ? `
              <div class="detail-item">
                <div class="detail-label">🔑 Property Access</div>
                <div class="detail-value">${workOrder.access_code}</div>
              </div>
              ` : ''}
            </div>
          </div>

          ${workOrder.description ? `
          <div class="description-section">
            <div class="detail-label" style="margin-bottom: 12px;">📋 Description</div>
            <div class="detail-value">${workOrder.description.replace(/\n/g, '<br>')}</div>
          </div>
          ` : ''}

          ${workOrder.scope_of_work ? `
          <div class="description-section">
            <div class="detail-label" style="margin-bottom: 12px;">🔧 Scope of Work</div>
            <div class="detail-value">${workOrder.scope_of_work.replace(/\n/g, '<br>')}</div>
          </div>
          ` : ''}

          ${workOrder.special_instructions ? `
          <div class="description-section">
            <div class="detail-label" style="margin-bottom: 12px;">⚠️ Special Instructions</div>
            <div class="detail-value">${workOrder.special_instructions.replace(/\n/g, '<br>')}</div>
          </div>
          ` : ''}
        </div>

        <div class="contact-section">
          <div class="contact-title">Need to Get in Touch?</div>
          <div class="contact-info">
            <div class="contact-detail">
              <span>📞</span>
              <span><strong>Phone:</strong> <a href="tel:+15412551698">+1 541-255-1698</a></span>
            </div>
            <div class="contact-detail">
              <span>✉️</span>
              <span><strong>Email:</strong> <a href="mailto:team@moxievacationrentals.com">team@moxievacationrentals.com</a></span>
            </div>
            <div class="contact-detail">
              <span>📍</span>
              <span><strong>Address:</strong> 2472 Willamette St, Eugene, OR 97405</span>
            </div>
          </div>
          
          <div class="footer-note">
            <p><strong>Important:</strong> Please acknowledge this work order within 24 hours of receipt.</p>
            <p style="margin-top: 16px;">
              This is an automated message from Moxie Vacation Rentals. 
              We're here to help make your work seamless and efficient.
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}
