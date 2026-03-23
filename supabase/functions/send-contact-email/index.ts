import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { Resend } from "npm:resend@6.9.4";
import { decryptApiKey, isEncrypted } from "../_shared/encryption.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContactEmailRequest {
  name: string;
  email: string;
  phone?: string;
  message: string;
  propertyId?: string;
  propertyName?: string;
  organizationId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('Send contact email function called');

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { name, email, phone, message, propertyId, propertyName, organizationId }: ContactEmailRequest = await req.json();

    // Get organization ID from property if provided, or use the passed organizationId
    let orgId = organizationId;
    if (propertyId && !orgId) {
      const { data: property } = await supabaseAdmin
        .from('properties')
        .select('organization_id')
        .eq('id', propertyId)
        .single();
      orgId = property?.organization_id;
    }

    // Fetch organization's Resend API key
    let resendApiKey = "";
    if (orgId) {
      const { data: orgData } = await supabaseAdmin
        .from('organizations')
        .select('resend_api_key')
        .eq('id', orgId)
        .single();

      if (orgData?.resend_api_key) {
        resendApiKey = orgData.resend_api_key;
        if (isEncrypted(resendApiKey)) {
          resendApiKey = await decryptApiKey(resendApiKey);
        }
        console.log("✅ Using organization's Resend API key");
      }
    }

    // Fallback to global secret
    if (!resendApiKey) {
      resendApiKey = Deno.env.get('RESEND_API_KEY') || "";
      if (resendApiKey) {
        console.log("ℹ️ Using global RESEND_API_KEY as fallback");
      }
    }

    if (!resendApiKey) {
      throw new Error('Resend API key not configured. Please add your Resend API key in Settings > Communications.');
    }

    const resend = new Resend(resendApiKey);

    // Get site settings - scope to organization if available
    let settingsQuery = supabaseAdmin
      .from('site_settings')
      .select('key, value')
      .in('key', ['siteName', 'contactEmail', 'emailFromAddress', 'emailFromName']);
    
    if (orgId) {
      settingsQuery = settingsQuery.eq('organization_id', orgId);
    }

    const { data: settings } = await settingsQuery;

    const settingsMap = settings?.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, any>) || {};

    const siteName = settingsMap.siteName || 'Vacation Rentals';
    const contactEmail = settingsMap.contactEmail || '';
    const fromEmail = settingsMap.emailFromAddress || contactEmail || '';
    const fromName = settingsMap.emailFromName || siteName;

    if (!fromEmail) {
      throw new Error('No from email address configured. Please set an Email From Address or Contact Email in Settings.');
    }

    if (!contactEmail) {
      throw new Error('No contact email configured. Please set a Contact Email in Settings.');
    }

    // ==========================================
    // Store in Guest Inbox + Platform Inbox
    // ==========================================
    let threadId: string | null = null;
    let platformInboxId: string | null = null;

    if (orgId) {
      // 1. Create/get Guest Inbox thread
      try {
        const { data: tid, error: threadError } = await supabaseAdmin
          .rpc('get_or_create_inbox_thread', {
            p_organization_id: orgId,
            p_guest_email: email,
            p_guest_name: name,
            p_guest_phone: phone || null,
          });

        if (threadError) {
          console.error("Error getting/creating inbox thread:", threadError);
        } else {
          threadId = tid;
          console.log("✅ Guest Inbox thread:", threadId);

          // Store as guest communication
          const { error: commError } = await supabaseAdmin
            .from('guest_communications')
            .insert({
              thread_id: threadId,
              message_type: 'email',
              subject: `Contact Form: ${propertyName ? `Re: ${propertyName}` : 'General Inquiry'}`,
              message_content: message,
              direction: 'inbound',
              sender_email: email,
              is_read: false,
              delivery_status: 'received',
              sent_at: new Date().toISOString(),
              source_platform: 'contact_form',
              raw_email_data: {
                source: 'contact_form',
                name,
                email,
                phone: phone || null,
                property_name: propertyName || null,
              },
            });

          if (commError) {
            console.error("Error storing guest communication:", commError);
          } else {
            console.log("✅ Contact form stored in Guest Inbox");
          }
        }
      } catch (e) {
        console.error("Error storing in Guest Inbox:", e);
      }

      // 2. Store in Platform Inbox as a support ticket
      try {
        const { data: inboxItem, error: inboxError } = await supabaseAdmin
          .from('platform_inbox')
          .insert({
            type: 'support',
            category: 'contact_form',
            subject: `Contact Form: ${name} - ${propertyName ? `Re: ${propertyName}` : 'General Inquiry'}`,
            description: message,
            name: name,
            email: email,
            organization_id: orgId,
            priority: 'normal',
            status: 'open',
          })
          .select('id')
          .single();

        if (inboxError) {
          console.error("Error storing in Platform Inbox:", inboxError);
        } else {
          platformInboxId = inboxItem?.id;
          console.log("✅ Contact form stored in Platform Inbox:", platformInboxId);
        }
      } catch (e) {
        console.error("Error storing in Platform Inbox:", e);
      }
    }

    // ==========================================
    // Send email notifications (existing logic)
    // ==========================================

    // Email to business owner
    const businessEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #667eea; margin: 0;">${siteName}</h1>
          <h2 style="color: #4a5568; margin: 10px 0 0 0;">New Contact Form Submission</h2>
        </div>
        
        <div style="background: #f8fafc; padding: 30px; border-radius: 12px; border: 1px solid #e2e8f0;">
          <h3 style="color: #1a202c; margin-top: 0;">Contact Details</h3>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #4a5568;">Name:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #1a202c;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #4a5568;">Email:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #1a202c;">
                <a href="mailto:${email}" style="color: #667eea;">${email}</a>
              </td>
            </tr>
            ${phone ? `
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #4a5568;">Phone:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #1a202c;">
                <a href="tel:${phone}" style="color: #667eea;">${phone}</a>
              </td>
            </tr>
            ` : ''}
            ${propertyName ? `
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-weight: 600; color: #4a5568;">Property:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e2e8f0; color: #1a202c;">${propertyName}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 10px 0; font-weight: 600; color: #4a5568; vertical-align: top;">Message:</td>
              <td style="padding: 10px 0; color: #1a202c;">${message}</td>
            </tr>
          </table>
          
          <div style="margin-top: 20px; padding: 15px; background: #e6fffa; border-radius: 6px; border-left: 4px solid #38b2ac;">
            <p style="margin: 0; color: #2d3748; font-size: 14px;">
              <strong>Next Steps:</strong> Reply directly to this email to respond to ${name}, or call them at ${phone || 'the provided contact information'}.
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #a0aec0; font-size: 12px;">
          <p>Received: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `;

    // Confirmation email to customer
    const customerEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #667eea; margin: 0;">${siteName}</h1>
        </div>
        
        <div style="background: #f8fafc; padding: 30px; border-radius: 12px; border: 1px solid #e2e8f0;">
          <h2 style="color: #1a202c; margin-top: 0;">Thank you for contacting us!</h2>
          
          <p style="color: #4a5568; line-height: 1.6;">
            Hello ${name},
          </p>
          
          <p style="color: #4a5568; line-height: 1.6;">
            We've received your message and will get back to you as soon as possible. Here's a copy of what you sent:
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 20px 0;">
            <p style="color: #2d3748; margin: 0; font-style: italic;">"${message}"</p>
          </div>
          
          <p style="color: #4a5568; line-height: 1.6;">
            Our team typically responds within 24 hours during business days. If you have an urgent inquiry, please call us directly.
          </p>
          
          <div style="margin-top: 20px; padding: 15px; background: #f0fff4; border-radius: 6px; border-left: 4px solid #48bb78;">
            <p style="margin: 0; color: #2d3748; font-size: 14px;">
              <strong>Need immediate assistance?</strong> Contact us directly at ${contactEmail}
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #a0aec0; font-size: 12px;">
          <p>© ${new Date().getFullYear()} ${siteName}. All rights reserved.</p>
        </div>
      </div>
    `;

    // Send email to business
    const businessEmailResult = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [contactEmail],
      replyTo: email,
      subject: `New Contact Form: ${name} - ${propertyName ? `Re: ${propertyName}` : 'General Inquiry'}`,
      html: businessEmailHtml,
    });

    // Send confirmation to customer
    const customerEmailResult = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [email],
      subject: `Thank you for contacting ${siteName}`,
      html: customerEmailHtml,
    });

    if (businessEmailResult.error || customerEmailResult.error) {
      throw new Error(businessEmailResult.error?.message || customerEmailResult.error?.message);
    }

    console.log('Contact emails sent successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        businessEmailId: businessEmailResult.data?.id,
        customerEmailId: customerEmailResult.data?.id,
        threadId,
        platformInboxId,
        message: 'Contact emails sent and stored successfully'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error sending contact email:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to send contact email',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
