
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
    const trackingId = url.searchParams.get("t");

    if (!trackingId) {
      return new Response("Missing tracking ID", { status: 400 });
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get the click tracking record
    const { data: clickData, error: clickError } = await supabase
      .from("newsletter_click_tracking")
      .select("*")
      .eq("tracking_id", trackingId)
      .single();

    if (clickError || !clickData) {
      return new Response("Invalid tracking ID", { status: 404 });
    }

    // Get client info
    const userAgent = req.headers.get("user-agent") || "";
    const forwardedFor = req.headers.get("x-forwarded-for") || "";
    const ipAddress = forwardedFor.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "";

    // Record the click event
    await supabase.from("newsletter_analytics").insert({
      campaign_id: clickData.campaign_id,
      subscriber_email: clickData.subscriber_email,
      event_type: "clicked",
      user_agent: userAgent,
      ip_address: ipAddress,
      event_data: {
        url: clickData.original_url,
        tracking_id: trackingId,
        timestamp: new Date().toISOString()
      }
    });

    // Update click tracking record
    await supabase
      .from("newsletter_click_tracking")
      .update({
        clicked_at: new Date().toISOString(),
        click_count: clickData.click_count + 1
      })
      .eq("tracking_id", trackingId);

    // Update campaign statistics
    const { data: analytics } = await supabase
      .from("newsletter_analytics")
      .select("event_type")
      .eq("campaign_id", clickData.campaign_id);

    if (analytics) {
      const clicks = analytics.filter(a => a.event_type === "clicked").length;
      const sent = analytics.filter(a => a.event_type === "sent").length;
      const clickRate = sent > 0 ? (clicks / sent) * 100 : 0;

      await supabase
        .from("newsletter_campaigns")
        .update({
          total_clicks: clicks,
          click_rate: clickRate
        })
        .eq("id", clickData.campaign_id);
    }

    // Redirect to original URL
    return Response.redirect(clickData.original_url, 302);

  } catch (error) {
    console.error("Error tracking newsletter click:", error);
    return new Response("Error", { status: 500 });
  }
};

serve(handler);
