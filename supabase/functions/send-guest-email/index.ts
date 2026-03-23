import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@6.9.4";
import { decryptApiKey, isEncrypted } from "../_shared/encryption.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendGuestEmailRequest {
  reservationId?: string | null;
  recipientEmail?: string;
  recipientName?: string;
  subject: string;
  message: string;
  threadId?: string;
  organizationId?: string;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reservationId, recipientEmail, recipientName, subject, message, threadId, organizationId }: SendGuestEmailRequest = await req.json();

    console.log("[send-guest-email] Request received:", { reservationId, recipientEmail, subject, threadId, organizationId });

    if (!subject || !message) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields: subject, message" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Variables for guest info and organization
    let guestEmail = recipientEmail;
    let guestName = recipientName || 'Guest';
    let propertyTitle: string | null = null;
    let checkInDate: string | null = null;
    let checkOutDate: string | null = null;
    let orgId = organizationId;

    // If reservationId provided, fetch reservation details
    if (reservationId) {
      const { data: reservation, error: reservationError } = await supabase
        .from("property_reservations")
        .select(`
          id,
          guest_name,
          guest_email,
          guest_phone,
          property_id,
          check_in_date,
          check_out_date,
          properties (
            id,
            title,
            organization_id
          )
        `)
        .eq("id", reservationId)
        .single();

      if (reservationError || !reservation) {
        console.log("[send-guest-email] Reservation not found, using direct recipient info");
      } else {
        guestEmail = reservation.guest_email || guestEmail;
        guestName = reservation.guest_name || guestName;
        propertyTitle = reservation.properties?.title || null;
        checkInDate = reservation.check_in_date;
        checkOutDate = reservation.check_out_date;
        orgId = orgId || reservation.properties?.organization_id;
        
        console.log("[send-guest-email] Reservation found:", { 
          guestEmail, 
          guestName,
          propertyTitle 
        });
      }
    }

    if (!guestEmail) {
      return new Response(
        JSON.stringify({ success: false, error: "No recipient email address provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch organization email settings
    let fromEmail = "noreply@moxievacationrentals.com";
    let fromName = "Moxie Vacation Rentals";
    let replyTo = "reply@inbound.moxievacationrentals.com";
    let siteName = "Moxie Vacation Rentals";
    let contactEmail = "";
    let contactPhone = "";
    let contactAddress = "";
    
    // Email styling defaults
    let emailHeaderColor = "#3b82f6";
    let emailHeaderColorEnd = "#1d4ed8";
    let emailAccentColor = "#3b82f6";
    let emailFooterColor = "#f8fafc";

    if (orgId) {
      const { data: settings } = await supabase
        .from("site_settings")
        .select("key, value")
        .eq("organization_id", orgId)
        .in("key", [
          "emailFromAddress", "emailFromName", "emailReplyTo", "siteName", 
          "contactEmail", "phone", "address",
          "emailHeaderColor", "emailHeaderColorEnd", "emailAccentColor", "emailFooterColor"
        ]);

      if (settings) {
        const settingsMap = settings.reduce((acc: Record<string, string>, s: { key: string; value: string }) => {
          acc[s.key] = typeof s.value === 'string' ? s.value.replace(/^"|"$/g, '') : s.value;
          return acc;
        }, {});

        fromEmail = settingsMap.emailFromAddress || fromEmail;
        fromName = settingsMap.siteName || settingsMap.emailFromName || fromName;
        replyTo = settingsMap.emailReplyTo || replyTo;
        siteName = settingsMap.siteName || fromName;
        contactEmail = settingsMap.contactEmail || "";
        contactPhone = settingsMap.phone || "";
        contactAddress = settingsMap.address || "";
        
        // Email styling
        emailHeaderColor = settingsMap.emailHeaderColor || emailHeaderColor;
        emailHeaderColorEnd = settingsMap.emailHeaderColorEnd || emailHeaderColorEnd;
        emailAccentColor = settingsMap.emailAccentColor || emailAccentColor;
        emailFooterColor = settingsMap.emailFooterColor || emailFooterColor;
      }
    }

    console.log("[send-guest-email] Email settings:", { fromEmail, fromName, replyTo });
    console.log("[send-guest-email] Email styling:", { emailHeaderColor, emailHeaderColorEnd, emailAccentColor, emailFooterColor });

    // Get Resend API key - first try organization-level, then fall back to global
    let resendApiKey = "";

    if (orgId) {
      const { data: org } = await supabase
        .from("organizations")
        .select("resend_api_key, inbound_email_prefix")
        .eq("id", orgId)
        .single();

      // Use org-specific inbound email prefix for Reply-To if available
      if (org?.inbound_email_prefix) {
        replyTo = `${org.inbound_email_prefix}@inbox.staymoxie.com`;
        console.log("[send-guest-email] Using org inbound Reply-To:", replyTo);
      }

      if (org?.resend_api_key) {
        resendApiKey = org.resend_api_key;
        console.log("[send-guest-email] Found organization Resend API key");
        
        // Decrypt if encrypted
        if (isEncrypted(resendApiKey)) {
          try {
            resendApiKey = await decryptApiKey(resendApiKey);
            console.log("[send-guest-email] Successfully decrypted organization Resend API key");
          } catch (decryptError) {
            console.error("[send-guest-email] Failed to decrypt Resend API key:", decryptError);
            resendApiKey = "";
          }
        }
      }
    }

    // Fall back to global secret if org key not available
    if (!resendApiKey) {
      resendApiKey = Deno.env.get("RESEND_API_KEY") || "";
      if (resendApiKey) {
        console.log("[send-guest-email] Using global RESEND_API_KEY");
      }
    }

    if (!resendApiKey) {
      console.error("[send-guest-email] No Resend API key configured");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "No Resend API key configured. Please add your Resend API key in Organization Settings > Integrations." 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resend = new Resend(resendApiKey);

    // Build contact info section for footer
    const contactInfoLines = [];
    if (contactEmail) contactInfoLines.push(`Email: ${contactEmail}`);
    if (contactPhone) contactInfoLines.push(`Phone: ${contactPhone}`);
    if (contactAddress) contactInfoLines.push(contactAddress);
    const contactInfoHtml = contactInfoLines.length > 0 
      ? `<p style="margin: 8px 0 0; color: #6b7280; font-size: 13px;">${contactInfoLines.join('<br>')}</p>` 
      : '';

    // Build professional HTML email with dynamic colors
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
  <div style="background: linear-gradient(135deg, ${emailHeaderColor} 0%, ${emailHeaderColorEnd} 100%); padding: 30px; border-radius: 12px 12px 0 0;">
    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">${siteName}</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="margin-top: 0; color: #374151;">Hi ${guestName},</p>
    
    <div style="white-space: pre-wrap; color: #374151;">${message}</div>
    
    ${propertyTitle ? `
    <div style="margin-top: 24px; padding: 16px; background: #eff6ff; border-radius: 8px; border-left: 4px solid ${emailAccentColor};">
      <p style="margin: 0; font-weight: 600; color: #1e40af;">Your Reservation</p>
      <p style="margin: 8px 0 0 0; color: #475569;">
        ${propertyTitle}<br>
        ${checkInDate ? `Check-in: ${new Date(checkInDate).toLocaleDateString()}` : ''}<br>
        ${checkOutDate ? `Check-out: ${new Date(checkOutDate).toLocaleDateString()}` : ''}
      </p>
    </div>
    ` : ''}
  </div>
  
  <div style="background: ${emailFooterColor}; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none; text-align: center;">
    <p style="margin: 0; font-weight: 600; color: #374151; font-size: 15px;">${siteName}</p>
    ${contactInfoHtml}
    <p style="margin: 16px 0 0; color: #9ca3af; font-size: 12px;">
      Simply reply to this email if you have any questions.
    </p>
  </div>
</body>
</html>
    `;

    // Send email via Resend
    console.log("[send-guest-email] Sending email to:", guestEmail);
    
    const emailResponse = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [guestEmail],
      reply_to: replyTo,
      subject: subject,
      html: htmlContent,
    });

    console.log("[send-guest-email] Resend response:", emailResponse);

    if (emailResponse.error) {
      console.error("[send-guest-email] Resend error:", emailResponse.error);
      return new Response(
        JSON.stringify({ success: false, error: emailResponse.error.message || "Failed to send email" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Store the communication in database (only if we have a reservationId)
    if (reservationId) {
      const { error: insertError } = await supabase
        .from("guest_communications")
        .insert({
          reservation_id: reservationId,
          thread_id: threadId || null,
          message_type: "email",
          direction: "outbound",
          subject: subject,
          message_content: message,
          sender_email: fromEmail,
          delivery_status: "sent",
          sent_at: new Date().toISOString(),
          external_message_id: emailResponse.data?.id || null,
        });

      if (insertError) {
        console.error("[send-guest-email] Failed to store communication:", insertError);
        // Don't fail the request, email was sent successfully
      }
    }

    console.log("[send-guest-email] Email sent successfully to:", guestEmail);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email sent successfully",
        emailId: emailResponse.data?.id 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[send-guest-email] Unexpected error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
