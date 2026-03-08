import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createAdminNotification, NOTIFICATION_TYPES, NOTIFICATION_CATEGORIES } from '../_shared/notifications.ts';

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

    // Resend webhooks don't include email body — fetch it from the Receiving API
    if (!emailData.html && !emailData.text && emailData.email_id) {
      const resendApiKey = Deno.env.get("RESEND_API_KEY");
      if (resendApiKey) {
        try {
          console.log("[InboundWebhook] Fetching email body from Resend API for:", emailData.email_id);
          const resendRes = await fetch(`https://api.resend.com/emails/${emailData.email_id}`, {
            headers: { "Authorization": `Bearer ${resendApiKey}` },
          });
          if (resendRes.ok) {
            const fullEmail = await resendRes.json();
            emailData.html = fullEmail.html || emailData.html;
            emailData.text = fullEmail.text || emailData.text;
            console.log("[InboundWebhook] Fetched email body, html length:", emailData.html?.length || 0);
          } else {
            console.warn("[InboundWebhook] Failed to fetch email from Resend:", resendRes.status, await resendRes.text());
          }
        } catch (fetchErr) {
          console.error("[InboundWebhook] Error fetching email body from Resend:", fetchErr);
        }
      } else {
        console.warn("[InboundWebhook] No RESEND_API_KEY configured, cannot fetch email body");
      }
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find matching platform email address
    const recipientEmail = emailData.to[0]?.toLowerCase();
    const { data: emailAddress, error: addressError } = await supabase
      .from("platform_email_addresses")
      .select("*")
      .eq("is_active", true)
      .ilike("email_address", recipientEmail)
      .single();

    if (addressError || !emailAddress) {
      console.log("No matching platform email address found for:", recipientEmail);
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

    // Insert the email into platform_emails (existing behavior)
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

    // ============================================
    // GUEST INBOX ROUTING — route to guest inbox
    // ============================================
    await routeToGuestInbox(supabase, emailData, senderInfo, recipientEmail);

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

/**
 * Route an inbound email to the guest inbox system.
 * 1. Find org from recipient email domain
 * 2. Try to match sender to a reservation
 * 3. Create/find inbox thread and insert guest_communications record
 */
async function routeToGuestInbox(
  supabase: ReturnType<typeof createClient>,
  emailData: ResendInboundEmail["data"],
  senderInfo: { email: string; name: string | null },
  recipientEmail: string
) {
  try {
    // Determine organization from recipient email domain
    const recipientDomain = recipientEmail?.split('@')[1]?.toLowerCase();
    if (!recipientDomain) {
      console.log("[GuestInbox] No recipient domain, skipping guest inbox routing");
      return;
    }

    // Look up org by custom_domain or website containing this domain
    const { data: org } = await supabase
      .from('organizations')
      .select('id, name')
      .or(`custom_domain.ilike.%${recipientDomain}%,website.ilike.%${recipientDomain}%`)
      .eq('is_active', true)
      .limit(1)
      .single();

    // Also check site_settings for contactEmail matching the recipient
    let organizationId = org?.id || null;

    if (!organizationId) {
      const { data: settingsMatch } = await supabase
        .from('site_settings')
        .select('organization_id')
        .eq('key', 'contactEmail')
        .ilike('value', recipientEmail)
        .limit(1)
        .single();

      organizationId = settingsMatch?.organization_id || null;
    }

    // Also check emailFromAddress site setting
    if (!organizationId) {
      const { data: settingsMatch } = await supabase
        .from('site_settings')
        .select('organization_id')
        .eq('key', 'emailFromAddress')
        .ilike('value', recipientEmail)
        .limit(1)
        .single();

      organizationId = settingsMatch?.organization_id || null;
    }

    if (!organizationId) {
      console.log("[GuestInbox] Could not determine organization for domain:", recipientDomain);
      return;
    }

    console.log("[GuestInbox] Matched organization:", organizationId);

    // Extract the plain text content for the message
    let messageContent = emailData.text || "";
    if (!messageContent && emailData.html) {
      messageContent = emailData.html
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .trim();
    }

    // Try to find a matching reservation by sender email
    let reservationId: string | null = null;
    let guestName = senderInfo.name || null;

    const { data: reservations } = await supabase
      .from('property_reservations')
      .select('id, guest_name, guest_email, property_id')
      .eq('organization_id', organizationId)
      .ilike('guest_email', senderInfo.email)
      .order('created_at', { ascending: false })
      .limit(1);

    if (reservations && reservations.length > 0) {
      reservationId = reservations[0].id;
      guestName = reservations[0].guest_name || guestName;
      console.log("[GuestInbox] Matched reservation:", reservationId, "for guest:", guestName);
    } else {
      console.log("[GuestInbox] No reservation match for sender:", senderInfo.email, "— creating unmatched thread");
    }

    // Get or create inbox thread
    const { data: inboxThreadId, error: threadError } = await supabase
      .rpc('get_or_create_inbox_thread', {
        p_organization_id: organizationId,
        p_guest_email: senderInfo.email,
        p_guest_name: guestName || senderInfo.email,
        p_guest_phone: null,
      });

    if (threadError) {
      console.error("[GuestInbox] Error getting/creating thread:", threadError);
      return;
    }

    console.log("[GuestInbox] Thread ID:", inboxThreadId);

    // Insert into guest_communications
    const { data: comm, error: commError } = await supabase
      .from('guest_communications')
      .insert({
        reservation_id: reservationId,
        thread_id: inboxThreadId,
        organization_id: organizationId,
        message_type: 'email',
        subject: emailData.subject || '(No Subject)',
        message_content: messageContent,
        direction: 'inbound',
        sender_email: senderInfo.email,
        is_read: false,
        delivery_status: 'received',
        sent_at: new Date().toISOString(),
        source_platform: 'email',
        raw_email_data: {
          from: emailData.from,
          to: emailData.to,
          cc: emailData.cc,
          headers: emailData.headers,
          has_attachments: (emailData.attachments?.length || 0) > 0,
          body_html: emailData.html || null,
        },
      })
      .select()
      .single();

    if (commError) {
      console.error("[GuestInbox] Error inserting guest communication:", commError);
      return;
    }

    // Update thread with last message preview
    await supabase
      .from('guest_inbox_threads')
      .update({
        last_message_at: new Date().toISOString(),
        last_message_preview: (emailData.subject || '') + ': ' + (messageContent || '').substring(0, 100),
        is_read: false,
        status: 'awaiting_reply',
        updated_at: new Date().toISOString(),
      })
      .eq('id', inboxThreadId);

    // Create admin notification
    await createAdminNotification(supabase, {
      organizationId,
      notificationType: NOTIFICATION_TYPES.GUEST_MESSAGE,
      category: NOTIFICATION_CATEGORIES.COMMUNICATIONS,
      title: `New Email from ${guestName || senderInfo.email}`,
      message: emailData.subject || '(No Subject)',
      actionUrl: `/admin/host/inbox/${inboxThreadId}`,
      metadata: {
        thread_id: inboxThreadId,
        reservation_id: reservationId,
        sender_email: senderInfo.email,
        message_type: 'email',
      },
      priority: 'normal',
    });

    console.log("[GuestInbox] Successfully routed email to guest inbox:", comm?.id);
  } catch (error) {
    // Don't let guest inbox routing failures break the main webhook
    console.error("[GuestInbox] Error routing to guest inbox:", error);
  }
}
