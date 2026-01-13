import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendEmailRequest {
  from_address_id?: string; // Platform email address ID to send from
  from_email?: string; // Or direct email address
  from_name?: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  html?: string;
  text?: string;
  reply_to?: string;
  template_id?: string;
  template_variables?: Record<string, string>;
  in_reply_to_email_id?: string; // For threading
  linked_inbox_item_id?: string;
  linked_organization_id?: string;
}

// Replace template variables
function processTemplate(content: string, variables: Record<string, string>): string {
  let result = content;
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return result;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    // Verify authorization
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify user is platform admin
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: platformAdmin } = await supabase
      .from("platform_admins")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!platformAdmin) {
      return new Response(
        JSON.stringify({ error: "Not authorized as platform admin" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: SendEmailRequest = await req.json();

    // Determine from address
    let fromEmail = body.from_email;
    let fromName = body.from_name;
    let emailAddressId = body.from_address_id;

    if (body.from_address_id) {
      const { data: platformAddress } = await supabase
        .from("platform_email_addresses")
        .select("*")
        .eq("id", body.from_address_id)
        .single();

      if (platformAddress) {
        fromEmail = platformAddress.email_address;
        fromName = fromName || platformAddress.display_name;
        emailAddressId = platformAddress.id;
      }
    }

    if (!fromEmail) {
      throw new Error("No from email address specified");
    }

    // Process template if provided
    let subject = body.subject;
    let html = body.html;
    let text = body.text;

    if (body.template_id) {
      const { data: template } = await supabase
        .from("platform_email_templates")
        .select("*")
        .eq("id", body.template_id)
        .single();

      if (template) {
        const variables = body.template_variables || {};
        subject = processTemplate(template.subject, variables);
        html = processTemplate(template.body_html, variables);
        text = template.body_text ? processTemplate(template.body_text, variables) : undefined;

        // Increment usage count
        await supabase
          .from("platform_email_templates")
          .update({ usage_count: template.usage_count + 1 })
          .eq("id", template.id);
      }
    }

    // Get threading info if replying
    let inReplyTo: string | undefined;
    let references: string[] = [];
    let threadId: string | undefined;
    let parentEmailId: string | undefined;

    if (body.in_reply_to_email_id) {
      const { data: parentEmail } = await supabase
        .from("platform_emails")
        .select("id, thread_id, external_email_id, references_header")
        .eq("id", body.in_reply_to_email_id)
        .single();

      if (parentEmail) {
        inReplyTo = parentEmail.external_email_id;
        threadId = parentEmail.thread_id || parentEmail.id;
        parentEmailId = parentEmail.id;
        references = [...(parentEmail.references_header || [])];
        if (parentEmail.external_email_id) {
          references.push(parentEmail.external_email_id);
        }
      }
    }

    // Build the from field
    const fromField = fromName ? `${fromName} <${fromEmail}>` : fromEmail;

    // Send via Resend
    const resendPayload: Record<string, unknown> = {
      from: fromField,
      to: body.to,
      subject,
    };

    if (body.cc?.length) resendPayload.cc = body.cc;
    if (body.bcc?.length) resendPayload.bcc = body.bcc;
    if (body.reply_to) resendPayload.reply_to = body.reply_to;
    if (html) resendPayload.html = html;
    if (text) resendPayload.text = text;

    // Add threading headers
    if (inReplyTo) {
      resendPayload.headers = {
        "In-Reply-To": inReplyTo,
        "References": references.join(" "),
      };
    }

    console.log("Sending email via Resend:", { to: body.to, subject });

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resendPayload),
    });

    const resendResult = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("Resend API error:", resendResult);
      throw new Error(resendResult.message || "Failed to send email");
    }

    // Store the outbound email
    const { data: newEmail, error: insertError } = await supabase
      .from("platform_emails")
      .insert({
        email_address_id: emailAddressId,
        external_email_id: resendResult.id,
        direction: "outbound",
        from_address: fromEmail,
        from_name: fromName,
        to_addresses: body.to,
        cc_addresses: body.cc || [],
        bcc_addresses: body.bcc || [],
        reply_to: body.reply_to,
        subject,
        body_text: text,
        body_html: html,
        is_read: true, // Outbound is always "read"
        thread_id: threadId,
        parent_email_id: parentEmailId,
        in_reply_to: inReplyTo,
        references_header: references.length > 0 ? references : null,
        assigned_to: user.id,
        linked_inbox_item_id: body.linked_inbox_item_id,
        linked_organization_id: body.linked_organization_id,
        sent_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error storing outbound email:", insertError);
      // Don't throw - email was sent successfully
    }

    // If no thread existed, update this email to be the thread root
    if (!threadId && newEmail) {
      await supabase
        .from("platform_emails")
        .update({ thread_id: newEmail.id })
        .eq("id", newEmail.id);
    }

    console.log("Email sent successfully:", resendResult.id);

    return new Response(
      JSON.stringify({
        success: true,
        email_id: newEmail?.id,
        resend_id: resendResult.id,
        thread_id: threadId || newEmail?.id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});