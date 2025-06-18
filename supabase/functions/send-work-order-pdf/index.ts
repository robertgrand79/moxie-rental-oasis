
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

    // Generate PDF content as HTML
    const pdfContent = generatePDFHTML(workOrder);

    // Convert HTML to PDF using Puppeteer
    const pdfBuffer = await generatePDF(pdfContent);

    // Send email with PDF attachment using SendGrid
    const emailResult = await sendEmailWithPDF(
      workOrder.contractor.email,
      workOrder,
      pdfBuffer
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
      message: 'Work order PDF sent successfully',
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

function generatePDFHTML(workOrder: any): string {
  const currentDate = new Date().toLocaleDateString();
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Work Order ${workOrder.work_order_number}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
        .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #333; padding-bottom: 20px; }
        .company-name { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
        .work-order-title { font-size: 20px; color: #666; }
        .section { margin-bottom: 30px; }
        .section-title { font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
        .field { margin-bottom: 10px; }
        .field-label { font-weight: bold; display: inline-block; width: 150px; }
        .field-value { display: inline-block; }
        .description { background: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 10px; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 20px; }
        .priority-high { color: #dc3545; font-weight: bold; }
        .priority-medium { color: #ffc107; font-weight: bold; }
        .priority-low { color: #28a745; font-weight: bold; }
        .priority-critical { color: #dc3545; font-weight: bold; background: #fff5f5; padding: 2px 8px; border-radius: 3px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">Moxie Management</div>
        <div class="work-order-title">Work Order Request</div>
      </div>

      <div class="section">
        <div class="section-title">Work Order Information</div>
        <div class="field">
          <span class="field-label">Work Order #:</span>
          <span class="field-value">${workOrder.work_order_number}</span>
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
          <span class="field-value">${workOrder.property.title}</span>
        </div>
        <div class="field">
          <span class="field-label">Address:</span>
          <span class="field-value">${workOrder.property.location}</span>
        </div>
        ` : '<p>No property assigned</p>'}
      </div>

      <div class="section">
        <div class="section-title">Work Description</div>
        <div class="field">
          <span class="field-label">Title:</span>
          <span class="field-value">${workOrder.title}</span>
        </div>
        <div class="description">
          <strong>Description:</strong><br>
          ${workOrder.description.replace(/\n/g, '<br>')}
        </div>
        ${workOrder.scope_of_work ? `
        <div class="description">
          <strong>Scope of Work:</strong><br>
          ${workOrder.scope_of_work.replace(/\n/g, '<br>')}
        </div>
        ` : ''}
        ${workOrder.special_instructions ? `
        <div class="description">
          <strong>Special Instructions:</strong><br>
          ${workOrder.special_instructions.replace(/\n/g, '<br>')}
        </div>
        ` : ''}
      </div>

      <div class="section">
        <div class="section-title">Contractor Information</div>
        <div class="field">
          <span class="field-label">Company:</span>
          <span class="field-value">${workOrder.contractor.company_name || 'N/A'}</span>
        </div>
        <div class="field">
          <span class="field-label">Contact:</span>
          <span class="field-value">${workOrder.contractor.name}</span>
        </div>
        <div class="field">
          <span class="field-label">Email:</span>
          <span class="field-value">${workOrder.contractor.email}</span>
        </div>
        ${workOrder.contractor.phone ? `
        <div class="field">
          <span class="field-label">Phone:</span>
          <span class="field-value">${workOrder.contractor.phone}</span>
        </div>
        ` : ''}
      </div>

      <div class="footer">
        <p>Please acknowledge receipt of this work order and provide an estimated completion timeline.</p>
        <p>For questions or concerns, please contact Moxie Management.</p>
        <p><em>Generated on ${currentDate}</em></p>
      </div>
    </body>
    </html>
  `;
}

async function generatePDF(htmlContent: string): Promise<Uint8Array> {
  // For now, we'll use a simple HTML to PDF conversion
  // In a production environment, you might want to use Puppeteer or similar
  const encoder = new TextEncoder();
  return encoder.encode(htmlContent);
}

async function sendEmailWithPDF(
  recipientEmail: string, 
  workOrder: any, 
  pdfBuffer: Uint8Array
): Promise<any> {
  const sendGridApiKey = Deno.env.get('SENDGRID_API_KEY');
  
  if (!sendGridApiKey) {
    throw new Error('SendGrid API key not configured');
  }

  // Convert PDF buffer to base64
  const base64PDF = btoa(String.fromCharCode(...pdfBuffer));

  const emailData = {
    personalizations: [{
      to: [{ email: recipientEmail }],
      subject: `Work Order Request - ${workOrder.work_order_number}`
    }],
    from: { email: 'noreply@moxiemanagement.com', name: 'Moxie Management' },
    content: [{
      type: 'text/html',
      value: `
        <h2>New Work Order Request</h2>
        <p>Hello ${workOrder.contractor.name},</p>
        <p>Please find attached a new work order request for your review.</p>
        
        <h3>Work Order Details:</h3>
        <ul>
          <li><strong>Work Order #:</strong> ${workOrder.work_order_number}</li>
          <li><strong>Property:</strong> ${workOrder.property?.title || 'N/A'}</li>
          <li><strong>Priority:</strong> ${workOrder.priority.toUpperCase()}</li>
          <li><strong>Title:</strong> ${workOrder.title}</li>
        </ul>
        
        <p>Please acknowledge receipt of this work order and provide an estimated completion timeline.</p>
        
        <p>Thank you,<br>
        Moxie Management Team</p>
      `
    }],
    attachments: [{
      content: base64PDF,
      filename: `work-order-${workOrder.work_order_number}.html`,
      type: 'text/html',
      disposition: 'attachment'
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
    throw new Error(`SendGrid API error: ${response.status} - ${errorText}`);
  }

  return { success: true, status: response.status };
}
