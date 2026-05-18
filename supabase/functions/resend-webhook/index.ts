// Resend outbound webhook handler. Receives delivery events for emails we sent
// via send-newsletter / send-guest-email / etc., and acts on the ones that
// affect future deliverability:
//
//   email.bounced         → add to newsletter_suppression (reason: hard/soft_bounce)
//   email.complained      → add to newsletter_suppression (reason: complaint)
//                           AND mark subscriber inactive (they hit "spam")
//   email.delivered       → log to newsletter_analytics as 'delivered'
//   email.failed          → log to newsletter_analytics as 'failed'
//
// Without this, hard bounces silently accumulate at Resend and the sender
// domain's reputation tanks. Complaints are even worse — Resend will
// eventually block the account if the complaint rate exceeds ~0.3%.
//
// Org + campaign context is recovered from the `tags` Resend echoes back. The
// send-newsletter function (post this PR) attaches { organization_id, campaign_id }
// tags on every outbound email; we read them here. For events lacking tags (older
// emails, or emails sent by other functions), we fall back to looking up the
// recipient email in newsletter_subscribers to find the org.
//
// Signature verification uses Svix (Resend's webhook signer), same pattern as
// resend-inbound-webhook.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Webhook } from "https://esm.sh/svix@1.15.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature",
};

interface ResendTag { name: string; value: string; }
interface ResendEventData {
  email_id: string;
  from: string;
  to: string[];
  subject?: string;
  created_at: string;
  tags?: ResendTag[];
  bounce?: { type?: string; subType?: string; message?: string };
  click?: { link: string };
}
interface ResendWebhookPayload {
  type: string;
  created_at: string;
  data: ResendEventData;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const rawBody = await req.text();

    const webhookSecret = Deno.env.get("RESEND_WEBHOOK_SECRET");
    if (!webhookSecret) {
      console.error("RESEND_WEBHOOK_SECRET not configured");
      return new Response(JSON.stringify({ error: "Webhook secret not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const svixId = req.headers.get("svix-id");
    const svixTimestamp = req.headers.get("svix-timestamp");
    const svixSignature = req.headers.get("svix-signature");
    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error("Missing Svix headers");
      return new Response(JSON.stringify({ error: "Missing signature headers" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let payload: ResendWebhookPayload;
    try {
      const wh = new Webhook(webhookSecret);
      payload = wh.verify(rawBody, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as ResendWebhookPayload;
    } catch (verifyError) {
      console.error("Svix signature verification failed:", verifyError);
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { type, data } = payload;
    const recipientEmail = data.to?.[0]?.toLowerCase();
    if (!recipientEmail) {
      console.warn(`Event ${type} has no recipient; skipping`);
      return new Response(JSON.stringify({ ok: true, skipped: "no recipient" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Resolve organization_id from tags, falling back to subscriber lookup.
    const tagMap = new Map((data.tags ?? []).map(t => [t.name, t.value]));
    let organizationId = tagMap.get("organization_id");
    const campaignId = tagMap.get("campaign_id");

    if (!organizationId) {
      const { data: sub } = await supabase
        .from("newsletter_subscribers")
        .select("organization_id")
        .eq("email", recipientEmail)
        .limit(1)
        .maybeSingle();
      organizationId = sub?.organization_id;
    }

    if (!organizationId) {
      console.warn(`Event ${type} for ${recipientEmail}: no org context recoverable; skipping`);
      return new Response(JSON.stringify({ ok: true, skipped: "no org context" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`📨 Resend event ${type} for ${recipientEmail} (org=${organizationId}, campaign=${campaignId ?? 'n/a'})`);

    switch (type) {
      case "email.bounced": {
        // Resend's bounce.type is "Permanent" (hard) | "Transient" (soft) | "Undetermined".
        // Treat Permanent as hard; everything else as soft. Only hard bounces fully
        // suppress; soft bounces (full inbox, temporary issue) are recorded so we
        // can show repeat-soft-bouncers in the admin UI later.
        const bounceType = data.bounce?.type?.toLowerCase();
        const reason = bounceType === "permanent" ? "hard_bounce" : "soft_bounce";

        await supabase
          .from("newsletter_suppression")
          .upsert({
            organization_id: organizationId,
            email: recipientEmail,
            reason,
            resend_event_id: data.email_id,
            metadata: { bounce: data.bounce, campaign_id: campaignId },
          }, { onConflict: "organization_id,email" });

        if (campaignId) {
          await supabase.from("newsletter_analytics").insert({
            campaign_id: campaignId,
            subscriber_email: recipientEmail,
            event_type: "bounced",
            event_data: { bounce: data.bounce, resend_event_id: data.email_id },
          });
        }
        break;
      }

      case "email.complained": {
        // Spam complaint — most damaging to sender reputation. Suppress AND
        // deactivate the subscriber so admin reactivation requires a deliberate
        // step (not just an import overwrite).
        await supabase
          .from("newsletter_suppression")
          .upsert({
            organization_id: organizationId,
            email: recipientEmail,
            reason: "complaint",
            resend_event_id: data.email_id,
            metadata: { campaign_id: campaignId },
          }, { onConflict: "organization_id,email" });

        await supabase
          .from("newsletter_subscribers")
          .update({ is_active: false, is_subscribed: false, email_opt_in: false, updated_at: new Date().toISOString() })
          .eq("email", recipientEmail)
          .eq("organization_id", organizationId);

        if (campaignId) {
          await supabase.from("newsletter_analytics").insert({
            campaign_id: campaignId,
            subscriber_email: recipientEmail,
            event_type: "complained",
            event_data: { resend_event_id: data.email_id },
          });
        }
        break;
      }

      case "email.delivered": {
        if (campaignId) {
          await supabase.from("newsletter_analytics").insert({
            campaign_id: campaignId,
            subscriber_email: recipientEmail,
            event_type: "delivered",
            event_data: { resend_event_id: data.email_id },
          });
        }
        break;
      }

      case "email.failed": {
        if (campaignId) {
          await supabase.from("newsletter_analytics").insert({
            campaign_id: campaignId,
            subscriber_email: recipientEmail,
            event_type: "failed",
            event_data: { resend_event_id: data.email_id, reason: data.bounce?.message },
          });
        }
        break;
      }

      // email.opened and email.clicked are already tracked by our own
      // tracking-pixel and click-rewrite functions. We deliberately skip them
      // here to avoid double-counting.
      default:
        console.log(`Ignoring event type ${type}`);
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in resend-webhook function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
