import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";
import { decryptApiKey, isEncrypted } from "../_shared/encryption.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationPayload {
  notification_id: string;
  organization_id: string;
  user_id: string | null;
  notification_type: string;
  category: string;
  title: string;
  message: string;
  action_url: string | null;
  priority: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: NotificationPayload = await req.json();
    
    console.log("[Instant Notification] Processing notification:", {
      id: payload.notification_id,
      type: payload.notification_type,
      title: payload.title,
      user_id: payload.user_id,
    });

    // Get recipients - either specific user or all org admins/owners
    let recipients: { user_id: string; email: string; phone: string | null; full_name: string }[] = [];

    if (payload.user_id) {
      // Specific user notification
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, email, phone, full_name")
        .eq("id", payload.user_id)
        .single();

      if (profile) {
        recipients = [{
          user_id: profile.id,
          email: profile.email,
          phone: profile.phone,
          full_name: profile.full_name || "Team Member",
        }];
      }
    } else {
      // Organization-wide notification - send to admins/owners (using separate queries to avoid FK join issues)
      const { data: orgMembers } = await supabase
        .from("organization_members")
        .select("user_id, role")
        .eq("organization_id", payload.organization_id)
        .in("role", ["admin", "owner"]);

      if (orgMembers && orgMembers.length > 0) {
        const userIds = orgMembers.map(m => m.user_id);
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, email, phone, full_name")
          .in("id", userIds);

        recipients = (profiles || []).map(p => ({
          user_id: p.id,
          email: p.email,
          phone: p.phone,
          full_name: p.full_name || "Team Member",
        }));
      }
    }

    console.log(`[Instant Notification] Found ${recipients.length} recipients`);

    if (recipients.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No recipients found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get organization details
    const { data: org } = await supabase
      .from("organizations")
      .select("id, name, resend_api_key, openphone_api_key, openphone_phone_number")
      .eq("id", payload.organization_id)
      .single();

    if (!org) {
      console.error("[Instant Notification] Organization not found:", payload.organization_id);
      return new Response(
        JSON.stringify({ error: "Organization not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get brand colors for email
    const { data: colorSettings } = await supabase
      .from("site_settings")
      .select("key, value")
      .eq("organization_id", org.id)
      .in("key", ["primaryColor", "accentColor"]);

    const brandColors = {
      primary: colorSettings?.find(s => s.key === "primaryColor")?.value?.replace(/"/g, "") || "#2563eb",
      accent: colorSettings?.find(s => s.key === "accentColor")?.value?.replace(/"/g, "") || "#3b82f6",
    };

    const results: { recipient: string; email_sent: boolean; sms_sent: boolean; errors: string[] }[] = [];

    for (const recipient of recipients) {
      const recipientResults = { 
        recipient: recipient.email, 
        email_sent: false, 
        sms_sent: false, 
        errors: [] as string[] 
      };

      // Check user's notification preferences
      const { data: preferences } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", recipient.user_id)
        .eq("organization_id", payload.organization_id)
        .eq("notification_type", payload.notification_type)
        .single();

      // Default preferences if none set (send instant email for high/urgent priority)
      const shouldSendEmail = preferences?.email_instant ?? 
        (payload.priority === "urgent" || payload.priority === "high" || payload.notification_type === "guest_message");
      const shouldSendSMS = preferences?.sms ?? (payload.priority === "urgent");

      console.log(`[Instant Notification] Preferences for ${recipient.email}:`, {
        email_instant: shouldSendEmail,
        sms: shouldSendSMS,
        found_preferences: !!preferences,
      });

      // Send instant email if enabled
      if (shouldSendEmail) {
        try {
          let resendApiKey = org.resend_api_key;
          if (resendApiKey && isEncrypted(resendApiKey)) {
            resendApiKey = await decryptApiKey(resendApiKey);
          }
          resendApiKey = resendApiKey || Deno.env.get("RESEND_API_KEY");

          if (resendApiKey) {
            const resend = new Resend(resendApiKey);
            const emailHtml = generateNotificationEmailHtml({
              organizationName: org.name,
              title: payload.title,
              message: payload.message,
              category: payload.category,
              priority: payload.priority,
              actionUrl: payload.action_url,
              brandColors,
            });

            await resend.emails.send({
              from: `${org.name} <notifications@resend.dev>`,
              to: [recipient.email],
              subject: `${getPriorityEmoji(payload.priority)} ${payload.title}`,
              html: emailHtml,
            });

            recipientResults.email_sent = true;
            console.log(`[Instant Notification] Email sent to ${recipient.email}`);
          } else {
            recipientResults.errors.push("No Resend API key configured");
          }
        } catch (emailError: any) {
          console.error(`[Instant Notification] Email error for ${recipient.email}:`, emailError);
          recipientResults.errors.push(`Email: ${emailError.message}`);
        }
      }

      // Send SMS if enabled and phone available
      if (shouldSendSMS && recipient.phone) {
        try {
          let openPhoneApiKey = org.openphone_api_key;
          if (openPhoneApiKey && isEncrypted(openPhoneApiKey)) {
            openPhoneApiKey = await decryptApiKey(openPhoneApiKey);
          }
          openPhoneApiKey = openPhoneApiKey || Deno.env.get("OPENPHONE_API_KEY");

          const fromPhoneId = org.openphone_phone_number;

          if (openPhoneApiKey && fromPhoneId) {
            // Format phone number
            let formattedTo = recipient.phone.trim();
            if (!formattedTo.startsWith('+')) {
              formattedTo = formattedTo.startsWith('1') ? `+${formattedTo}` : `+1${formattedTo}`;
            }

            const smsContent = `${getPriorityEmoji(payload.priority)} ${payload.title}\n\n${payload.message}${payload.action_url ? `\n\nView: ${payload.action_url}` : ''}`;

            const smsResponse = await fetch('https://api.openphone.com/v1/messages', {
              method: 'POST',
              headers: {
                'Authorization': openPhoneApiKey,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                to: [formattedTo],
                content: smsContent.substring(0, 1600), // SMS character limit
                from: fromPhoneId,
              }),
            });

            if (smsResponse.ok) {
              recipientResults.sms_sent = true;
              console.log(`[Instant Notification] SMS sent to ${recipient.phone}`);
            } else {
              const errorText = await smsResponse.text();
              recipientResults.errors.push(`SMS: ${smsResponse.status} - ${errorText}`);
            }
          } else {
            recipientResults.errors.push("No OpenPhone configuration");
          }
        } catch (smsError: any) {
          console.error(`[Instant Notification] SMS error for ${recipient.phone}:`, smsError);
          recipientResults.errors.push(`SMS: ${smsError.message}`);
        }
      }

      results.push(recipientResults);
    }

    console.log("[Instant Notification] Completed:", results);

    return new Response(
      JSON.stringify({ success: true, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("[Instant Notification] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

function getPriorityEmoji(priority: string): string {
  switch (priority) {
    case "urgent": return "🚨";
    case "high": return "⚠️";
    case "normal": return "📢";
    case "low": return "ℹ️";
    default: return "📢";
  }
}

function generateNotificationEmailHtml(data: {
  organizationName: string;
  title: string;
  message: string;
  category: string;
  priority: string;
  actionUrl: string | null;
  brandColors: { primary: string; accent: string };
}): string {
  const { organizationName, title, message, category, priority, actionUrl, brandColors } = data;
  
  const priorityBg = priority === "urgent" ? "#dc2626" : 
                     priority === "high" ? "#f59e0b" : 
                     brandColors.primary;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: ${priorityBg}; padding: 24px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 600;">
                ${getPriorityEmoji(priority)} ${title}
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px 24px;">
              <p style="margin: 0 0 16px; color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                ${category.replace(/_/g, " ")}
              </p>
              <p style="margin: 0 0 24px; color: #3f3f46; font-size: 16px; line-height: 1.6;">
                ${message}
              </p>
              ${actionUrl ? `
              <a href="${actionUrl}" style="display: inline-block; background-color: ${brandColors.primary}; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500;">
                View Details →
              </a>
              ` : ''}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 16px 24px; background-color: #fafafa; border-top: 1px solid #e4e4e7;">
              <p style="margin: 0; color: #a1a1aa; font-size: 12px; text-align: center;">
                ${organizationName} • Notification System
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

serve(handler);
