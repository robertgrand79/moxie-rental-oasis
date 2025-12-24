import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ESCALATION_THRESHOLD_MINUTES = 30;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("[Auto-Escalate] Starting escalation check...");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find unread urgent notifications older than threshold
    const thresholdTime = new Date(Date.now() - ESCALATION_THRESHOLD_MINUTES * 60 * 1000).toISOString();
    
    const { data: notifications, error: fetchError } = await supabase
      .from("admin_notifications")
      .select(`
        id,
        organization_id,
        user_id,
        notification_type,
        category,
        title,
        message,
        action_url,
        priority,
        created_at
      `)
      .eq("is_read", false)
      .eq("is_archived", false)
      .in("priority", ["urgent", "high"])
      .is("escalated_at", null)
      .lt("created_at", thresholdTime)
      .limit(50);

    if (fetchError) {
      throw new Error(`Failed to fetch notifications: ${fetchError.message}`);
    }

    console.log(`[Auto-Escalate] Found ${notifications?.length || 0} notifications to escalate`);

    if (!notifications || notifications.length === 0) {
      return new Response(
        JSON.stringify({ success: true, escalated: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let escalatedCount = 0;
    const errors: string[] = [];

    for (const notification of notifications) {
      try {
        // Mark as escalated
        await supabase
          .from("admin_notifications")
          .update({
            escalated_at: new Date().toISOString(),
            escalation_sent: true,
          })
          .eq("id", notification.id);

        // Get organization admins/owners
        const { data: orgMembers } = await supabase
          .from("organization_members")
          .select("user_id")
          .eq("organization_id", notification.organization_id)
          .in("role", ["admin", "owner"]);

        if (!orgMembers || orgMembers.length === 0) continue;

        const userIds = orgMembers.map(m => m.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, email, phone, full_name")
          .in("id", userIds);

        // Get organization details
        const { data: org } = await supabase
          .from("organizations")
          .select("name, resend_api_key, openphone_api_key, openphone_phone_number")
          .eq("id", notification.organization_id)
          .single();

        if (!org || !profiles) continue;

        // Send escalation email
        const resendApiKey = org.resend_api_key || Deno.env.get("RESEND_API_KEY");
        if (resendApiKey) {
          const resend = new Resend(resendApiKey);
          
          for (const profile of profiles) {
            try {
              await resend.emails.send({
                from: `${org.name} <notifications@resend.dev>`,
                to: [profile.email],
                subject: `🚨 ESCALATED: ${notification.title}`,
                html: generateEscalationEmailHtml({
                  organizationName: org.name,
                  recipientName: profile.full_name || "Team Member",
                  notification,
                  minutesUnread: ESCALATION_THRESHOLD_MINUTES,
                }),
              });
              console.log(`[Auto-Escalate] Escalation email sent to ${profile.email}`);
            } catch (emailErr) {
              console.error(`[Auto-Escalate] Email error for ${profile.email}:`, emailErr);
            }
          }
        }

        // Send escalation SMS for urgent priority
        if (notification.priority === "urgent") {
          const openPhoneApiKey = org.openphone_api_key || Deno.env.get("OPENPHONE_API_KEY");
          const fromPhoneId = org.openphone_phone_number;

          if (openPhoneApiKey && fromPhoneId) {
            for (const profile of profiles) {
              if (!profile.phone) continue;

              try {
                let formattedTo = profile.phone.trim();
                if (!formattedTo.startsWith('+')) {
                  formattedTo = formattedTo.startsWith('1') ? `+${formattedTo}` : `+1${formattedTo}`;
                }

                const smsContent = `🚨 ESCALATION: ${notification.title}\n\n${notification.message}\n\nThis urgent notification has been unread for ${ESCALATION_THRESHOLD_MINUTES}+ minutes.`;

                await fetch('https://api.openphone.com/v1/messages', {
                  method: 'POST',
                  headers: {
                    'Authorization': openPhoneApiKey,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    to: [formattedTo],
                    content: smsContent.substring(0, 1600),
                    from: fromPhoneId,
                  }),
                });
                console.log(`[Auto-Escalate] SMS sent to ${profile.phone}`);
              } catch (smsErr) {
                console.error(`[Auto-Escalate] SMS error for ${profile.phone}:`, smsErr);
              }
            }
          }
        }

        escalatedCount++;
      } catch (notifErr) {
        const msg = notifErr instanceof Error ? notifErr.message : String(notifErr);
        errors.push(`Notification ${notification.id}: ${msg}`);
        console.error(`[Auto-Escalate] Error processing notification ${notification.id}:`, notifErr);
      }
    }

    console.log(`[Auto-Escalate] Completed. Escalated: ${escalatedCount}, Errors: ${errors.length}`);

    return new Response(
      JSON.stringify({ success: true, escalated: escalatedCount, errors }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Auto-Escalate] Fatal error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function generateEscalationEmailHtml(data: {
  organizationName: string;
  recipientName: string;
  notification: any;
  minutesUnread: number;
}): string {
  const { organizationName, recipientName, notification, minutesUnread } = data;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #fef2f2;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); border: 2px solid #dc2626;">
          
          <tr>
            <td style="background-color: #dc2626; padding: 24px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 18px; font-weight: 600;">
                🚨 ESCALATION ALERT
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding: 32px 24px;">
              <p style="margin: 0 0 16px; color: #3f3f46; font-size: 14px;">
                Hi ${recipientName},
              </p>
              <p style="margin: 0 0 20px; color: #dc2626; font-size: 14px; font-weight: 500;">
                The following ${notification.priority} notification has been unread for over ${minutesUnread} minutes:
              </p>
              
              <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 16px; margin: 0 0 24px;">
                <p style="margin: 0 0 8px; font-weight: 600; color: #3f3f46;">${notification.title}</p>
                <p style="margin: 0; color: #71717a; font-size: 14px;">${notification.message}</p>
              </div>
              
              ${notification.action_url ? `
              <a href="${notification.action_url}" style="display: inline-block; background-color: #dc2626; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
                View Now →
              </a>
              ` : ''}
            </td>
          </tr>

          <tr>
            <td style="padding: 16px 24px; background-color: #fafafa; border-top: 1px solid #e4e4e7;">
              <p style="margin: 0; color: #a1a1aa; font-size: 12px; text-align: center;">
                ${organizationName} • Auto-Escalation System
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
