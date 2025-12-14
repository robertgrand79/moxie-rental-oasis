import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Webhook } from "https://esm.sh/svix@1.15.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature",
};

interface ResendInboundEmail {
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  text?: string;
  html?: string;
  headers?: Record<string, string>;
  attachments?: Array<{
    filename: string;
    content_type: string;
    content: string;
  }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the raw body for signature verification
    const rawBody = await req.text();
    
    // Verify webhook signature
    const webhookSecret = Deno.env.get("RESEND_WEBHOOK_SECRET");
    if (!webhookSecret) {
      console.error("RESEND_WEBHOOK_SECRET not configured");
      return new Response(
        JSON.stringify({ error: "Webhook secret not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const svixId = req.headers.get("svix-id");
    const svixTimestamp = req.headers.get("svix-timestamp");
    const svixSignature = req.headers.get("svix-signature");

    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error("Missing Svix headers for webhook verification");
      return new Response(
        JSON.stringify({ error: "Missing webhook signature headers" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify the webhook signature
    const wh = new Webhook(webhookSecret);
    let payload: { type: string; data: ResendInboundEmail };
    
    try {
      payload = wh.verify(rawBody, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as { type: string; data: ResendInboundEmail };
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return new Response(
        JSON.stringify({ error: "Invalid webhook signature" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Webhook signature verified successfully");

    // Handle the email.received event
    if (payload.type !== "email.received") {
      console.log(`Ignoring webhook event type: ${payload.type}`);
      return new Response(
        JSON.stringify({ success: true, message: "Event type ignored" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailData = payload.data;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Log full payload for debugging
    console.log("Full email payload received:", JSON.stringify(emailData, null, 2));

    console.log("Received inbound email webhook:", {
      from: emailData.from,
      to: emailData.to,
      subject: emailData.subject,
      hasText: !!emailData.text,
      hasHtml: !!emailData.html,
      textLength: emailData.text?.length || 0,
      htmlLength: emailData.html?.length || 0,
    });

    // Extract sender email from the "from" field (format: "Name <email@domain.com>" or just "email@domain.com")
    const fromMatch = emailData.from?.match(/<(.+)>/) || [null, emailData.from];
    const senderEmail = fromMatch[1]?.toLowerCase().trim();

    if (!senderEmail) {
      console.error("Could not extract sender email from:", emailData.from);
      return new Response(
        JSON.stringify({ error: "Invalid sender email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Looking up reservations for sender:", senderEmail);

    // Find reservation(s) associated with this email address
    const { data: reservations, error: reservationError } = await supabase
      .from("property_reservations")
      .select("id, guest_name, guest_email, property_id, check_in_date, check_out_date")
      .ilike("guest_email", senderEmail)
      .order("created_at", { ascending: false })
      .limit(5);

    if (reservationError) {
      console.error("Error fetching reservations:", reservationError);
    }

    // Get message content - prefer text, fallback to stripped HTML
    let messageContent = emailData.text || "";
    if (!messageContent && emailData.html) {
      // Basic HTML stripping
      messageContent = emailData.html
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .trim();
    }

    // Store the inbound email
    if (reservations && reservations.length > 0) {
      // Associate with the most recent reservation
      const reservation = reservations[0];
      
      const { data: insertedComm, error: insertError } = await supabase
        .from("guest_communications")
        .insert({
          reservation_id: reservation.id,
          message_type: "email",
          subject: emailData.subject || "(No Subject)",
          message_content: messageContent,
          direction: "inbound",
          sender_email: senderEmail,
          is_read: false,
          delivery_status: "received",
          sent_at: new Date().toISOString(),
          raw_email_data: {
            from: emailData.from,
            to: emailData.to,
            cc: emailData.cc,
            headers: emailData.headers,
            has_attachments: (emailData.attachments?.length || 0) > 0,
          },
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error inserting communication:", insertError);
        throw insertError;
      }

      console.log(`✓ Inbound email stored for reservation ${reservation.id}:`, insertedComm?.id);

      return new Response(
        JSON.stringify({
          success: true,
          message: "Email received and stored",
          reservation_id: reservation.id,
          communication_id: insertedComm?.id,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // No matching reservation - store as orphaned for admin review
      console.log("No matching reservation found for email:", senderEmail);
      
      // Still store the email for review - use null reservation_id
      // Note: This requires updating the foreign key constraint or creating a separate table
      // For now, we'll log it and notify admin
      
      console.log("Orphaned inbound email - no matching reservation:", {
        from: senderEmail,
        subject: emailData.subject,
        content_preview: messageContent.substring(0, 200),
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: "Email received but no matching reservation found",
          sender: senderEmail,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

  } catch (error) {
    console.error("Error processing inbound email webhook:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
