import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendGuestEmailRequest {
  reservationId: string;
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
    const { reservationId, subject, message, threadId, organizationId }: SendGuestEmailRequest = await req.json();

    console.log("[send-guest-email] Request received:", { reservationId, subject, threadId, organizationId });

    if (!reservationId || !subject || !message) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields: reservationId, subject, message" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch reservation details
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
      console.error("[send-guest-email] Reservation not found:", reservationError);
      return new Response(
        JSON.stringify({ success: false, error: "Reservation not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[send-guest-email] Reservation found:", { 
      guestEmail: reservation.guest_email, 
      guestName: reservation.guest_name,
      propertyTitle: reservation.properties?.title 
    });

    if (!reservation.guest_email) {
      return new Response(
        JSON.stringify({ success: false, error: "Guest has no email address" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get organization ID from reservation or request
    const orgId = organizationId || reservation.properties?.organization_id;

    // Fetch organization email settings
    let fromEmail = "noreply@moxievacationrentals.com";
    let fromName = "Moxie Vacation Rentals";
    let replyTo = "reply@inbound.moxievacationrentals.com";

    if (orgId) {
      const { data: settings } = await supabase
        .from("site_settings")
        .select("key, value")
        .eq("organization_id", orgId)
        .in("key", ["emailFromAddress", "emailFromName", "emailReplyTo", "siteName"]);

      if (settings) {
        const settingsMap = settings.reduce((acc: Record<string, string>, s: { key: string; value: string }) => {
          acc[s.key] = typeof s.value === 'string' ? s.value.replace(/^"|"$/g, '') : s.value;
          return acc;
        }, {});

        fromEmail = settingsMap.emailFromAddress || fromEmail;
        fromName = settingsMap.emailFromName || settingsMap.siteName || fromName;
        replyTo = settingsMap.emailReplyTo || replyTo;
      }
    }

    console.log("[send-guest-email] Email settings:", { fromEmail, fromName, replyTo });

    // Get Resend API key (global only for now)
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("[send-guest-email] RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resend = new Resend(resendApiKey);

    // Build professional HTML email
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 30px; border-radius: 12px 12px 0 0;">
    <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${fromName}</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="margin-top: 0;">Hi ${reservation.guest_name || 'Guest'},</p>
    
    <div style="white-space: pre-wrap;">${message}</div>
    
    ${reservation.properties?.title ? `
    <div style="margin-top: 24px; padding: 16px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #3b82f6;">
      <p style="margin: 0; font-weight: 600; color: #1e40af;">Your Reservation</p>
      <p style="margin: 8px 0 0 0; color: #64748b;">
        ${reservation.properties.title}<br>
        ${reservation.check_in_date ? `Check-in: ${new Date(reservation.check_in_date).toLocaleDateString()}` : ''}<br>
        ${reservation.check_out_date ? `Check-out: ${new Date(reservation.check_out_date).toLocaleDateString()}` : ''}
      </p>
    </div>
    ` : ''}
  </div>
  
  <div style="background: #f8fafc; padding: 20px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none; text-align: center;">
    <p style="margin: 0; color: #64748b; font-size: 14px;">
      This email was sent by ${fromName}.<br>
      Simply reply to this email if you have any questions.
    </p>
  </div>
</body>
</html>
    `;

    // Send email via Resend
    console.log("[send-guest-email] Sending email to:", reservation.guest_email);
    
    const emailResponse = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [reservation.guest_email],
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

    // Store the communication in database
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

    console.log("[send-guest-email] Email sent successfully to:", reservation.guest_email);

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
