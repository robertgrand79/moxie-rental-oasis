// process-scheduled-newsletters: cron worker invoked every 5 minutes by pg_cron.
// Scans newsletter_campaigns for rows whose scheduled_at has passed and sent_at
// is still null, then delegates to send-newsletter for each. We pass through
// the campaign_id so send-newsletter UPDATEs the existing row (preserving the
// admin's intended schedule + creator audit) rather than creating a duplicate.
//
// Auth: this function runs with service-role so it can read campaigns across
// orgs. It calls send-newsletter with the same service-role bearer and an
// `internalCall: true` body flag — send-newsletter recognises the pair and
// skips its admin-user auth check, trusting body.organizationId instead.
//
// Concurrency: pg_cron's per-job lock prevents overlapping invocations of the
// same schedule, so a long-running send won't trip a second worker into
// double-sending. Within a single tick, campaigns are processed sequentially —
// volume is low enough (a handful per 5-minute window in practice) that we
// don't need parallelism, and serial sends keep per-org Resend rate limits
// happy.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Pull every campaign whose scheduled_at has passed and hasn't been sent
    // yet. The (scheduled_at IS NOT NULL AND sent_at IS NULL) predicate is
    // indexed via idx_newsletter_campaigns_due so this stays cheap.
    const MAX_ATTEMPTS = 5;
    const nowIso = new Date().toISOString();
    const { data: due, error } = await supabase
      .from("newsletter_campaigns")
      .select("id, organization_id, subject, content, cover_image_url, linked_content, scheduled_at, send_attempts")
      .is("sent_at", null)
      .not("scheduled_at", "is", null)
      .lte("scheduled_at", nowIso)
      .lt("send_attempts", MAX_ATTEMPTS)
      .order("scheduled_at", { ascending: true })
      .limit(50);

    if (error) {
      console.error("❌ Failed to query due campaigns:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!due || due.length === 0) {
      console.log("✓ No scheduled newsletters due this tick");
      return new Response(JSON.stringify({ processed: 0 }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`📨 ${due.length} scheduled newsletter(s) due — dispatching`);

    const results: Array<{ id: string; status: "sent" | "failed"; detail?: string }> = [];

    for (const campaign of due) {
      const attempt = (campaign.send_attempts ?? 0) + 1;
      const isFinalAttempt = attempt >= MAX_ATTEMPTS;

      try {
        const response = await fetch(`${supabaseUrl}/functions/v1/send-newsletter`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${serviceRoleKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            internalCall: true,
            organizationId: campaign.organization_id,
            campaignId: campaign.id,
            subject: campaign.subject,
            content: campaign.content,
            coverImageUrl: campaign.cover_image_url,
            linkedContent: campaign.linked_content,
          }),
        });
        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          const failureReason = payload?.error || `HTTP ${response.status}`;
          console.error(`❌ Campaign ${campaign.id} attempt ${attempt}/${MAX_ATTEMPTS} failed:`, failureReason);

          // Stamp the attempt counter so the WHERE clause stops returning this
          // row once we hit MAX_ATTEMPTS. On the final attempt also clear
          // scheduled_at so the campaign moves out of the Scheduled state and
          // into a "Failed" terminal state (sent_at NULL, scheduled_at NULL,
          // send_failure_reason set, send_attempts=MAX). The UI surfaces that
          // as a red badge with a Retry action.
          await supabase
            .from("newsletter_campaigns")
            .update({
              send_attempts: attempt,
              last_attempt_at: new Date().toISOString(),
              send_failure_reason: failureReason,
              ...(isFinalAttempt ? { scheduled_at: null } : {}),
            })
            .eq("id", campaign.id);

          results.push({ id: campaign.id, status: "failed", detail: failureReason });
          continue;
        }

        // send-newsletter clears scheduled_at + sets sent_at internally on
        // success, so we only need to record the attempt count for the audit log.
        await supabase
          .from("newsletter_campaigns")
          .update({
            send_attempts: attempt,
            last_attempt_at: new Date().toISOString(),
            send_failure_reason: null,
          })
          .eq("id", campaign.id);

        console.log(`✅ Campaign ${campaign.id} dispatched: ${payload?.message ?? 'ok'}`);
        results.push({ id: campaign.id, status: "sent" });
      } catch (err: any) {
        console.error(`❌ Exception dispatching campaign ${campaign.id} (attempt ${attempt}/${MAX_ATTEMPTS}):`, err);
        await supabase
          .from("newsletter_campaigns")
          .update({
            send_attempts: attempt,
            last_attempt_at: new Date().toISOString(),
            send_failure_reason: err.message,
            ...(isFinalAttempt ? { scheduled_at: null } : {}),
          })
          .eq("id", campaign.id);
        results.push({ id: campaign.id, status: "failed", detail: err.message });
      }
    }

    return new Response(JSON.stringify({ processed: results.length, results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("❌ Error in process-scheduled-newsletters:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

serve(handler);
