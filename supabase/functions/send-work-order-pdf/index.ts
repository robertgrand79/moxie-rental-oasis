
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
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #374151;
          margin: 0;
          padding: 0;
          background-color: #f8fafc;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0 0 10px 0;
          font-size: 28px;
          font-weight: 700;
        }
        .work-order-number {
          background: rgba(255, 255, 255, 0.2);
          padding: 8px 16px;
          border-radius: 20px;
          display: inline-block;
          font-weight: 600;
          margin-top: 10px;
        }
        .content {
          padding: 40px 30px;
        }
        .acknowledge-section {
          background: #f0f9ff;
          border: 2px solid #0ea5e9;
          border-radius: 12px;
          padding: 25px;
          text-align: center;
          margin: 0 0 30px 0;
        }
        .acknowledge-button {
          display: inline-block;
          background: #0ea5e9;
          color: white;
          text-decoration: none;
          padding: 15px 30px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          margin: 15px 0 10px 0;
          transition: background-color 0.2s;
        }
        .acknowledge-button:hover {
          background: #0284c7;
        }
        .details-grid {
          display: grid;
          gap: 20px;
          margin: 30px 0;
        }
        .detail-card {
          background: #f8fafc;
          border-radius: 8px;
          padding: 20px;
          border-left: 4px solid #e5e7eb;
        }
        .detail-label {
          font-weight: 600;
          color: #4b5563;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 5px;
        }
        .detail-value {
          color: #1f2937;
          font-size: 16px;
        }
        .priority-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          text-transform: capitalize;
          color: white;
          background: ${priorityColor};
        }
        .description-section {
          background: #fffbeb;
          border-left: 4px solid #f59e0b;
          padding: 20px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .footer {
          background: #f8fafc;
          padding: 30px;
          text-align: center;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 14px;
        }
        .contact-info {
          margin-top: 20px;
        }
        @media (max-width: 600px) {
          .container {
            margin: 0;
            border-radius: 0;
          }
          .content {
            padding: 30px 20px;
          }
          .header {
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Work Order Assignment</h1>
          <div class="work-order-number">${workOrder.work_order_number}</div>
        </div>
        
        <div class="content">
          <div class="acknowledge-section">
            <h3 style="margin: 0 0 10px 0; color: #0c4a6e;">Action Required</h3>
            <p style="margin: 0 0 15px 0; color: #374151;">
              Please acknowledge receipt of this work order by clicking the button below:
            </p>
            <a href="${acknowledgementUrl}" class="acknowledge-button">
              ✓ Acknowledge Work Order
            </a>
            <p style="margin: 10px 0 0 0; font-size: 12px; color: #6b7280;">
              This confirms you have received and reviewed the work order details.
            </p>
          </div>

          <h2 style="color: #1f2937; margin: 0 0 20px 0;">Work Order Details</h2>
          
          <div class="details-grid">
            <div class="detail-card">
              <div class="detail-label">Title</div>
              <div class="detail-value">${workOrder.title}</div>
            </div>
            
            <div class="detail-card">
              <div class="detail-label">Priority</div>
              <span class="priority-badge">${workOrder.priority}</span>
            </div>
            
            ${workOrder.property ? `
            <div class="detail-card">
              <div class="detail-label">Property</div>
              <div class="detail-value">${workOrder.property.title}<br>
                <span style="color: #6b7280; font-size: 14px;">${workOrder.property.location}</span>
              </div>
            </div>
            ` : ''}
            
            ${workOrder.estimated_completion_date ? `
            <div class="detail-card">
              <div class="detail-label">Due Date</div>
              <div class="detail-value">${formatDate(workOrder.estimated_completion_date)}</div>
            </div>
            ` : ''}
            
            ${workOrder.access_code ? `
            <div class="detail-card">
              <div class="detail-label">Property Access</div>
              <div class="detail-value">${workOrder.access_code}</div>
            </div>
            ` : ''}
          </div>

          ${workOrder.description ? `
          <div class="description-section">
            <div class="detail-label">Description</div>
            <div class="detail-value">${workOrder.description.replace(/\n/g, '<br>')}</div>
          </div>
          ` : ''}

          ${workOrder.scope_of_work ? `
          <div class="description-section">
            <div class="detail-label">Scope of Work</div>
            <div class="detail-value">${workOrder.scope_of_work.replace(/\n/g, '<br>')}</div>
          </div>
          ` : ''}

          ${workOrder.special_instructions ? `
          <div class="description-section">
            <div class="detail-label">Special Instructions</div>
            <div class="detail-value">${workOrder.special_instructions.replace(/\n/g, '<br>')}</div>
          </div>
          ` : ''}
        </div>

        <div class="footer">
          <p><strong>Important:</strong> Please acknowledge this work order within 24 hours of receipt.</p>
          <div class="contact-info">
            <p>Questions about this work order?<br>
            Contact: Moxie Vacation Rentals<br>
            Email: team@moxievacationrentals.com</p>
          </div>
          <p style="margin-top: 20px; font-size: 12px;">
            This is an automated message. Please do not reply directly to this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}
