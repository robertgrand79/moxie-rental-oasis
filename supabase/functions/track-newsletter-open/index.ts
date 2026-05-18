
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
    const url = new URL(req.url);
    const campaignId = url.searchParams.get("c");
    const email = url.searchParams.get("e");

    if (!campaignId || !email) {
      return new Response("Missing parameters", { status: 400 });
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get client info
    const userAgent = req.headers.get("user-agent") || "";
    const forwardedFor = req.headers.get("x-forwarded-for") || "";
    const ipAddress = forwardedFor.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "";

    // Always record the raw open event for activity logs / per-device debugging.
    await supabase.from("newsletter_analytics").insert({
      campaign_id: campaignId,
      subscriber_email: email,
      event_type: "opened",
      user_agent: userAgent,
      ip_address: ipAddress,
      event_data: {
        timestamp: new Date().toISOString(),
        referrer: req.headers.get("referer") || ""
      }
    });

    // Recompute campaign rollup stats. Two important fixes vs. the old code:
    //   1. Count *unique* subscribers who opened, not total open events.
    //      Without dedup, a single subscriber opening on phone+desktop+tablet
    //      inflates opens to 3, and against a 1-recipient test send produces
    //      the impossible "300% open rate" we were displaying in the UI.
    //   2. Denominator is the campaign's recipient_count (actual recipients),
    //      not the count of 'sent' analytics rows. The 'sent' insert is
    //      best-effort and only runs for successful deliveries, which would
    //      inflate the rate if some recipients failed.
    //   The rate is clamped to [0, 100] as a final safety net.
    const { data: openRows } = await supabase
      .from("newsletter_analytics")
      .select("subscriber_email")
      .eq("campaign_id", campaignId)
      .eq("event_type", "opened");

    const { data: campaignRow } = await supabase
      .from("newsletter_campaigns")
      .select("recipient_count")
      .eq("id", campaignId)
      .single();

    if (openRows && campaignRow) {
      const uniqueOpens = new Set(openRows.map(r => r.subscriber_email)).size;
      const recipientCount = campaignRow.recipient_count || 0;
      const rawRate = recipientCount > 0 ? (uniqueOpens / recipientCount) * 100 : 0;
      const openRate = Math.max(0, Math.min(100, rawRate));

      await supabase
        .from("newsletter_campaigns")
        .update({
          total_opens: uniqueOpens,
          open_rate: openRate
        })
        .eq("id", campaignId);
    }

    // Return 1x1 transparent pixel
    const pixelData = new Uint8Array([
      0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x21, 0xF9, 0x04, 0x01, 0x00, 0x00, 0x00, 0x00, 0x2C, 0x00, 0x00,
      0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x04, 0x01, 0x00, 0x3B
    ]);

    return new Response(pixelData, {
      status: 200,
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
        ...corsHeaders
      }
    });

  } catch (error) {
    console.error("Error tracking newsletter open:", error);
    return new Response("Error", { status: 500 });
  }
};

serve(handler);
