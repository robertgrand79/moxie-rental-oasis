import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PushPayload {
  user_id?: string;
  organization_id?: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  priority?: 'high' | 'normal';
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: PushPayload = await req.json();
    
    console.log("[Mobile Push] Processing push notification:", {
      user_id: payload.user_id,
      org_id: payload.organization_id,
      title: payload.title,
    });

    // Get push tokens for the target users
    let query = supabase
      .from("push_notification_tokens")
      .select("token, platform, user_id")
      .eq("is_active", true);

    if (payload.user_id) {
      query = query.eq("user_id", payload.user_id);
    } else if (payload.organization_id) {
      query = query.eq("organization_id", payload.organization_id);
    } else {
      return new Response(
        JSON.stringify({ error: "Must specify user_id or organization_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: tokens, error: tokenError } = await query;

    if (tokenError) {
      throw new Error(`Failed to fetch tokens: ${tokenError.message}`);
    }

    if (!tokens || tokens.length === 0) {
      console.log("[Mobile Push] No active push tokens found");
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: "No active tokens" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[Mobile Push] Found ${tokens.length} active tokens`);

    // Get FCM server key
    const fcmServerKey = Deno.env.get("FCM_SERVER_KEY");
    
    if (!fcmServerKey) {
      console.warn("[Mobile Push] FCM_SERVER_KEY not configured");
      return new Response(
        JSON.stringify({ success: false, error: "FCM not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let sentCount = 0;
    let failedCount = 0;
    const failedTokens: string[] = [];

    // Send push notifications via FCM
    for (const tokenRecord of tokens) {
      try {
        const fcmPayload = {
          to: tokenRecord.token,
          notification: {
            title: payload.title,
            body: payload.body,
            sound: payload.priority === 'high' ? 'default' : undefined,
            badge: 1,
          },
          data: {
            ...payload.data,
            click_action: "FLUTTER_NOTIFICATION_CLICK",
          },
          priority: payload.priority === 'high' ? 'high' : 'normal',
          content_available: true,
        };

        const response = await fetch("https://fcm.googleapis.com/fcm/send", {
          method: "POST",
          headers: {
            "Authorization": `key=${fcmServerKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(fcmPayload),
        });

        const result = await response.json();

        if (result.success === 1) {
          sentCount++;
          console.log(`[Mobile Push] Sent to ${tokenRecord.platform} device`);
        } else if (result.failure === 1) {
          failedCount++;
          
          // Check if token is invalid and should be deactivated
          const errorResult = result.results?.[0];
          if (errorResult?.error === "NotRegistered" || errorResult?.error === "InvalidRegistration") {
            failedTokens.push(tokenRecord.token);
            console.log(`[Mobile Push] Token invalid, marking for deactivation`);
          }
        }
      } catch (pushErr) {
        console.error("[Mobile Push] Error sending to token:", pushErr);
        failedCount++;
      }
    }

    // Deactivate invalid tokens
    if (failedTokens.length > 0) {
      await supabase
        .from("push_notification_tokens")
        .update({ is_active: false })
        .in("token", failedTokens);
      
      console.log(`[Mobile Push] Deactivated ${failedTokens.length} invalid tokens`);
    }

    console.log(`[Mobile Push] Completed. Sent: ${sentCount}, Failed: ${failedCount}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: sentCount, 
        failed: failedCount,
        deactivated: failedTokens.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Mobile Push] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
