import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature",
};

interface ResendInboundEmail {
  type: string;
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    cc?: string[];
    subject: string;
    text?: string;
    html?: string;
    attachments?: Array<{
      filename: string;
      content_type: string;
      size: number;
    }>;
    headers?: Record<string, string>;
    reply_to?: string;
  };
}

// Generate a thread ID from subject line (strips Re:, Fwd:, etc.)
function normalizeSubjectForThreading(subject: string): string {
  return subject
    .replace(/^(re|fwd|fw):\s*/gi, '')
    .replace(/^(re|fwd|fw)\[\d+\]:\s*/gi, '')
    .trim()
    .toLowerCase();
}

// Extract sender name from email format "Name <email@example.com>"
function parseSenderInfo(from: string): { email: string; name: string | null } {
  const match = from.match(/^(.+?)\s*<(.+)>$/);
  if (match) {
    return { name: match[1].trim(), email: match[2].trim() };
  }
  return { name: null, email: from.trim() };
}

function normalizeEmailAddress(email: string | null | undefined): string {
  return String(email || "").trim().toLowerCase();
}

function isAutomatedInboundEmail(
  senderEmail: string,
  headers: Record<string, string> = {},
  subject: string | null | undefined,
): boolean {
  const normalizedSender = normalizeEmailAddress(senderEmail);
  const normalizedHeaders = Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [key.toLowerCase(), String(value || "")]),
  );

  const autoSubmitted = normalizedHeaders["auto-submitted"]?.toLowerCase() || "";
  const precedence = normalizedHeaders["precedence"]?.toLowerCase() || "";
  const xAutoResponseSuppress = normalizedHeaders["x-auto-response-suppress"]?.toLowerCase() || "";
  const content = `${normalizedSender} ${(subject || "").toLowerCase()}`;

  return (
    normalizedSender.endsWith("@resend.dev") ||
    normalizedSender.includes("mailer-daemon") ||
    normalizedSender.includes("postmaster@") ||
    normalizedSender.includes("no-reply@") ||
    normalizedSender.includes("noreply@") ||
    autoSubmitted.includes("auto-generated") ||
    autoSubmitted.includes("auto-replied") ||
    precedence === "bulk" ||
    precedence === "junk" ||
    precedence === "list" ||
    xAutoResponseSuppress.length > 0 ||
    content.includes("delivery status notification") ||
    content.includes("undeliver") ||
    content.includes("mail delivery subsystem") ||
    content.includes("out of office")
  );
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify webhook signature if secret is configured
    const webhookSecret = Deno.env.get("RESEND_WEBHOOK_SECRET");
    if (webhookSecret) {
      const svixId = req.headers.get("svix-id");
      const svixTimestamp = req.headers.get("svix-timestamp");
      const svixSignature = req.headers.get("svix-signature");

      if (!svixId || !svixTimestamp || !svixSignature) {
        console.error("Missing Svix headers");
        return new Response(
          JSON.stringify({ error: "Missing webhook signature headers" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Note: Full signature verification would require the Svix library
      // For now, we log and proceed - in production, implement full verification
      console.log("Webhook headers received:", { svixId, svixTimestamp });
    }

    const payload: ResendInboundEmail = await req.json();
    console.log("Received inbound email webhook:", payload.type);

    // Only process email.received events
    if (payload.type !== "email.received") {
      return new Response(
        JSON.stringify({ message: "Event type not processed", type: payload.type }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const emailData = payload.data;
    const senderInfo = parseSenderInfo(emailData.from);

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const recipientEmails = (emailData.to || [])
      .map((email) => normalizeEmailAddress(email))
      .filter(Boolean);

    if (recipientEmails.length === 0) {
      console.log("Skipping inbound email with no recipients");
      return new Response(
        JSON.stringify({ message: "Ignored: no recipient email address found" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find all active configured platform email addresses and match against any recipient
    const { data: activeAddresses, error: addressError } = await supabase
      .from("platform_email_addresses")
      .select("*")
      .eq("is_active", true);

    if (addressError) {
      throw addressError;
    }

    const emailAddress = (activeAddresses || []).find((address) =>
      recipientEmails.includes(normalizeEmailAddress(address.email_address))
    );

    if (!emailAddress) {
      console.log("Ignoring inbound email for inactive/unconfigured recipient(s):", recipientEmails);
      return new Response(
        JSON.stringify({ message: "Ignored: recipient is not an active configured platform inbox address" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (isAutomatedInboundEmail(senderInfo.email, emailData.headers || {}, emailData.subject)) {
      console.log("Ignoring automated/system inbound email:", {
        from: senderInfo.email,
        to: recipientEmails,
        subject: emailData.subject,
      });
      return new Response(
        JSON.stringify({ message: "Ignored: automated or system-generated sender" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Try to find existing thread based on subject
    const normalizedSubject = normalizeSubjectForThreading(emailData.subject || "");
    let threadId: string | null = null;
    let parentEmailId: string | null = null;

    if (normalizedSubject) {
      const { data: existingThreadEmail } = await supabase
        .from("platform_emails")
        .select("id, thread_id")
        .or(`subject.ilike.%${normalizedSubject}%,subject.ilike.Re: %${normalizedSubject}%`)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (existingThreadEmail) {
        threadId = existingThreadEmail.thread_id || existingThreadEmail.id;
        parentEmailId = existingThreadEmail.id;
      }
    }

    // Insert the email
    const { data: newEmail, error: insertError } = await supabase
      .from("platform_emails")
      .insert({
        email_address_id: emailAddress?.id || null,
        external_email_id: emailData.email_id,
        direction: "inbound",
        from_address: senderInfo.email,
        from_name: senderInfo.name,
        to_addresses: emailData.to,
        cc_addresses: emailData.cc || [],
        reply_to: emailData.reply_to,
        subject: emailData.subject,
        body_text: emailData.text,
        body_html: emailData.html,
        attachments: emailData.attachments || [],
        headers: emailData.headers || {},
        thread_id: threadId,
        parent_email_id: parentEmailId,
        assigned_to: emailAddress?.auto_assign_to || null,
        received_at: payload.created_at,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting email:", insertError);
      throw insertError;
    }

    // If no thread existed, update this email to be the thread root
    if (!threadId && newEmail) {
      await supabase
        .from("platform_emails")
        .update({ thread_id: newEmail.id })
        .eq("id", newEmail.id);
    }

    // Auto-create support ticket if configured
    if (emailAddress?.auto_create_ticket && newEmail) {
      const { data: ticket, error: ticketError } = await supabase
        .from("platform_inbox")
        .insert({
          type: "support",
          status: "open",
          priority: "medium",
          subject: emailData.subject || "Email Inquiry",
          description: emailData.text || emailData.html || "",
          submitter_email: senderInfo.email,
          submitter_name: senderInfo.name,
          assigned_to: emailAddress.auto_assign_to,
        })
        .select()
        .single();

      if (!ticketError && ticket) {
        // Link the email to the ticket
        await supabase
          .from("platform_emails")
          .update({ linked_inbox_item_id: ticket.id })
          .eq("id", newEmail.id);

        console.log("Auto-created support ticket:", ticket.id);
      }
    }

    // Create notification for assigned admin
    if (emailAddress?.auto_assign_to) {
      await supabase.from("platform_notifications").insert({
        user_id: emailAddress.auto_assign_to,
        type: "email_received",
        title: "New Email Received",
        message: `New email from ${senderInfo.name || senderInfo.email}: ${emailData.subject || "(No subject)"}`,
        action_url: `/admin/platform/email?id=${newEmail?.id}`,
        metadata: {
          email_id: newEmail?.id,
          from: senderInfo.email,
          subject: emailData.subject,
        },
      });
    }

    console.log("Successfully processed inbound email:", newEmail?.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        email_id: newEmail?.id,
        thread_id: threadId || newEmail?.id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing inbound webhook:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
