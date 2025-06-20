
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendWorkOrderRequest {
  workOrderId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { workOrderId }: SendWorkOrderRequest = await req.json();

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch work order with related data
    const { data: workOrder, error: fetchError } = await supabaseClient
      .from('work_orders')
      .select(`
        *,
        contractor:contractors(*),
        property:properties(*),
        task:tasks(*)
      `)
      .eq('id', workOrderId)
      .single();

    if (fetchError || !workOrder) {
      throw new Error('Work order not found');
    }

    if (!workOrder.contractor?.email) {
      throw new Error('Contractor email not found');
    }

    // Get contact phone number from site settings
    const { data: phoneSettings } = await supabaseClient
      .from('site_settings')
      .select('value')
      .eq('key', 'contactPhone')
      .single();

    const contactPhone = phoneSettings?.value || '"(541) 555-0123"';

    // Generate email content
    const emailContent = generateEmailContent(workOrder, contactPhone);

    // Send email using SendGrid
    const emailResult = await sendWorkOrderEmail(
      workOrder.contractor.email,
      workOrder,
      emailContent
    );

    // Update work order status if it was in draft
    if (workOrder.status === 'draft') {
      await supabaseClient
        .from('work_orders')
        .update({ 
          status: 'sent',
          sent_at: new Date().toISOString()
        })
        .eq('id', workOrderId);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Work order email sent successfully',
      emailResult 
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

function generateEmailContent(workOrder: any, contactPhone: string): string {
  const currentDate = new Date().toLocaleDateString();
  const logoUrl = 'https://joiovubyokikqjytxtuv.supabase.co/storage/v1/object/public/uploads/7471f968-e7b4-49d2-9281-852c85dc81e4.png';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Work Order ${workOrder.work_order_number}</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          max-width: 600px; 
          margin: 0 auto; 
          padding: 20px;
          background-color: #f9f9f9;
        }
        .email-container {
          background-color: #ffffff;
          border-radius: 8px;
          padding: 30px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .header { 
          text-align: center; 
          margin-bottom: 30px; 
          border-bottom: 3px solid #2563eb; 
          padding-bottom: 20px; 
        }
        .company-logo { 
          max-width: 200px; 
          height: auto; 
          margin-bottom: 15px; 
        }
        .work-order-title { 
          font-size: 18px; 
          color: #64748b; 
          margin: 0;
        }
        .section { 
          margin-bottom: 25px; 
          background-color: #f8fafc;
          padding: 20px;
          border-radius: 6px;
          border-left: 4px solid #2563eb;
        }
        .section-title { 
          font-size: 18px; 
          font-weight: bold; 
          margin-bottom: 15px; 
          color: #1e293b; 
          border-bottom: 1px solid #e2e8f0; 
          padding-bottom: 8px; 
        }
        .field { 
          margin-bottom: 12px; 
          display: flex;
          flex-wrap: wrap;
        }
        .field-label { 
          font-weight: 600; 
          color: #475569;
          min-width: 140px;
          margin-bottom: 4px;
        }
        .field-value { 
          color: #1e293b;
          flex: 1;
        }
        .description-box { 
          background: #ffffff; 
          padding: 16px; 
          border-radius: 6px; 
          margin-top: 10px; 
          border: 1px solid #e2e8f0;
          white-space: pre-wrap;
        }
        .priority-high { color: #dc2626; font-weight: bold; }
        .priority-medium { color: #d97706; font-weight: bold; }
        .priority-low { color: #16a34a; font-weight: bold; }
        .priority-critical { 
          color: #dc2626; 
          font-weight: bold; 
          background: #fef2f2; 
          padding: 4px 12px; 
          border-radius: 4px; 
          display: inline-block;
        }
        .access-code-section {
          background: #f0f9ff;
          border: 2px solid #0ea5e9;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          text-align: center;
        }
        .access-code-title {
          font-size: 18px;
          font-weight: bold;
          color: #0c4a6e;
          margin-bottom: 10px;
        }
        .access-code-value {
          font-size: 24px;
          font-weight: bold;
          color: #0369a1;
          background: #ffffff;
          padding: 12px 20px;
          border-radius: 6px;
          border: 2px solid #0ea5e9;
          display: inline-block;
          margin-top: 10px;
          letter-spacing: 2px;
        }
        .contact-info {
          background: #eff6ff;
          padding: 20px;
          border-radius: 6px;
          margin-top: 20px;
          border-left: 4px solid #3b82f6;
        }
        .contact-title {
          font-size: 16px;
          font-weight: bold;
          color: #1e40af;
          margin-bottom: 15px;
        }
        .contact-item {
          margin-bottom: 10px;
          color: #1e40af;
        }
        .footer { 
          margin-top: 30px; 
          text-align: center; 
          font-size: 14px; 
          color: #64748b; 
          border-top: 1px solid #e2e8f0; 
          padding-top: 20px; 
          line-height: 1.5;
        }
        @media (max-width: 600px) {
          .field {
            flex-direction: column;
          }
          .field-label {
            min-width: auto;
          }
          .access-code-value {
            font-size: 20px;
            padding: 10px 15px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <img src="${logoUrl}" alt="Moxie Vacation Rentals" class="company-logo" />
          <h1 class="work-order-title">Work Order Request</h1>
        </div>

        <div class="section">
          <div class="section-title">Work Order Information</div>
          <div class="field">
            <span class="field-label">Work Order #:</span>
            <span class="field-value"><strong>${workOrder.work_order_number}</strong></span>
          </div>
          <div class="field">
            <span class="field-label">Date Issued:</span>
            <span class="field-value">${currentDate}</span>
          </div>
          <div class="field">
            <span class="field-label">Priority:</span>
            <span class="field-value priority-${workOrder.priority}">${workOrder.priority.toUpperCase()}</span>
          </div>
          <div class="field">
            <span class="field-label">Status:</span>
            <span class="field-value">${workOrder.status.replace('_', ' ').toUpperCase()}</span>
          </div>
          ${workOrder.estimated_completion_date ? `
          <div class="field">
            <span class="field-label">Target Completion:</span>
            <span class="field-value">${new Date(workOrder.estimated_completion_date).toLocaleDateString()}</span>
          </div>
          ` : ''}
        </div>

        <div class="section">
          <div class="section-title">Property Information</div>
          ${workOrder.property ? `
          <div class="field">
            <span class="field-label">Property Name:</span>
            <span class="field-value"><strong>${workOrder.property.title}</strong></span>
          </div>
          <div class="field">
            <span class="field-label">Address:</span>
            <span class="field-value">${workOrder.property.location}</span>
          </div>
          ` : '<p style="color: #64748b; font-style: italic;">No property assigned</p>'}
        </div>

        ${workOrder.access_code ? `
        <div class="access-code-section">
          <div class="access-code-title">🔑 Property Access Code</div>
          <p style="margin: 10px 0; color: #0c4a6e;">Use this code to access the property:</p>
          <div class="access-code-value">${workOrder.access_code}</div>
          <p style="margin-top: 15px; font-size: 14px; color: #0369a1;"><strong>Important:</strong> Keep this code secure and do not share with unauthorized personnel.</p>
        </div>
        ` : ''}

        <div class="section">
          <div class="section-title">Work Description</div>
          <div class="field">
            <span class="field-label">Title:</span>
            <span class="field-value"><strong>${workOrder.title}</strong></span>
          </div>
          <div class="description-box">
            <strong>Description:</strong><br>
            ${workOrder.description.replace(/\n/g, '<br>')}
          </div>
          ${workOrder.scope_of_work ? `
          <div class="description-box">
            <strong>Scope of Work:</strong><br>
            ${workOrder.scope_of_work.replace(/\n/g, '<br>')}
          </div>
          ` : ''}
          ${workOrder.special_instructions ? `
          <div class="description-box">
            <strong>Special Instructions:</strong><br>
            ${workOrder.special_instructions.replace(/\n/g, '<br>')}
          </div>
          ` : ''}
        </div>

        <div class="contact-info">
          <div class="contact-title">Need to Get in Touch?</div>
          <p style="margin-bottom: 15px; color: #1e40af;">
            Please acknowledge receipt of this work order and provide an estimated completion timeline.
          </p>
          <div class="contact-item">
            <strong>📧 Email:</strong> robert@moxievacationrentals.com
          </div>
          <div class="contact-item">
            <strong>📞 Phone:</strong> ${contactPhone.replace(/"/g, '')}
          </div>
          <p style="margin-top: 15px; font-size: 14px; color: #1e40af;">
            For urgent matters or questions about property access, please call directly.
          </p>
        </div>

        <div class="footer">
          <p><strong>Moxie Vacation Rentals</strong></p>
          <p>Professional Property Management Services</p>
          <p><em>Generated on ${currentDate}</em></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

async function sendWorkOrderEmail(
  recipientEmail: string, 
  workOrder: any, 
  emailContent: string
): Promise<any> {
  const sendGridApiKey = Deno.env.get('SENDGRID_API_KEY');
  
  if (!sendGridApiKey) {
    throw new Error('SendGrid API key not configured');
  }

  const emailData = {
    personalizations: [{
      to: [{ email: recipientEmail }],
      subject: `Work Order Request - ${workOrder.work_order_number} | ${workOrder.title}`
    }],
    from: { 
      email: 'robert@moxievacationrentals.com', 
      name: 'Robert - Moxie Vacation Rentals' 
    },
    content: [{
      type: 'text/html',
      value: emailContent
    }]
  };

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${sendGridApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(emailData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('SendGrid API Response:', response.status, errorText);
    throw new Error(`SendGrid API error: ${response.status} - ${errorText}`);
  }

  return { success: true, status: response.status };
}
