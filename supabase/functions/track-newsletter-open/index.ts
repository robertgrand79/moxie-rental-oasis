
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

    // Record the open event
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

    // Update campaign statistics
    const { data: analytics } = await supabase
      .from("newsletter_analytics")
      .select("event_type")
      .eq("campaign_id", campaignId);

    if (analytics) {
      const opens = analytics.filter(a => a.event_type === "opened").length;
      const sent = analytics.filter(a => a.event_type === "sent").length;
      const openRate = sent > 0 ? (opens / sent) * 100 : 0;

      await supabase
        .from("newsletter_campaigns")
        .update({
          total_opens: opens,
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
