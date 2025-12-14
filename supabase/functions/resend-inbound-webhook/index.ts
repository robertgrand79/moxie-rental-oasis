import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Webhook } from "https://esm.sh/svix@1.15.0";
import { decryptApiKey, isEncrypted } from "../_shared/encryption.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature",
};

interface ResendInboundEmail {
  email_id: string;
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

interface ResendEmailResponse {
  id: string;
  from: string;
  to: string[];
  subject: string;
  text?: string;
  html?: string;
  created_at: string;
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
    const emailId = emailData.email_id;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Webhook payload received:", {
      emailId,
      from: emailData.from,
      to: emailData.to,
      subject: emailData.subject,
    });

    // Extract sender email
    const fromMatch = emailData.from?.match(/<(.+)>/) || [null, emailData.from];
    const senderEmail = fromMatch[1]?.toLowerCase().trim();

    if (!senderEmail) {
      console.error("Could not extract sender email from:", emailData.from);
      return new Response(
        JSON.stringify({ error: "Invalid sender email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get recipient domain to find organization
    const recipientEmail = emailData.to?.[0];
    const recipientDomain = recipientEmail?.split('@')[1]?.toLowerCase();
    
    console.log("Looking up organization for domain:", recipientDomain);

    // Find organization by matching email domain
    let resendApiKey = Deno.env.get("RESEND_API_KEY") || "";
    
    if (recipientDomain) {
      const { data: org } = await supabase
        .from('organizations')
        .select('id, resend_api_key')
        .or(`website.ilike.%${recipientDomain}%,custom_domain.ilike.%${recipientDomain}%`)
        .single();
      
      if (org?.resend_api_key) {
        try {
          resendApiKey = isEncrypted(org.resend_api_key) 
            ? await decryptApiKey(org.resend_api_key) 
            : org.resend_api_key;
          console.log("Using organization-level Resend API key");
        } catch (e) {
          console.warn("Failed to decrypt org API key, using global:", e);
        }
      }
    }

    // Fetch full email content from Resend API
    let messageContent = "";
    
    if (emailId && resendApiKey) {
      console.log("Fetching full email content from Resend API for email:", emailId);
      
      try {
        const emailResponse = await fetch(`https://api.resend.com/emails/${emailId}`, {
          headers: { 
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json'
          },
        });
        
        if (emailResponse.ok) {
          const fullEmailData: ResendEmailResponse = await emailResponse.json();
          console.log("Full email data received:", {
            hasText: !!fullEmailData.text,
            hasHtml: !!fullEmailData.html,
            textLength: fullEmailData.text?.length || 0,
            htmlLength: fullEmailData.html?.length || 0,
          });
          
          messageContent = fullEmailData.text || "";
          if (!messageContent && fullEmailData.html) {
            // Basic HTML stripping
            messageContent = fullEmailData.html
              .replace(/<[^>]*>/g, "")
              .replace(/&nbsp;/g, " ")
              .replace(/&amp;/g, "&")
              .replace(/&lt;/g, "<")
              .replace(/&gt;/g, ">")
              .trim();
          }
        } else {
          console.error("Failed to fetch email content:", emailResponse.status, await emailResponse.text());
        }
      } catch (e) {
        console.error("Error fetching email content from Resend:", e);
      }
    }

    // Fallback to webhook data if API fetch failed
    if (!messageContent) {
      messageContent = emailData.text || "";
      if (!messageContent && emailData.html) {
        messageContent = emailData.html
          .replace(/<[^>]*>/g, "")
          .replace(/&nbsp;/g, " ")
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .trim();
      }
    }

    console.log("Final message content length:", messageContent.length);
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
