import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { breachId } = await req.json();

    if (!breachId) {
      return new Response(
        JSON.stringify({ error: "breachId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch breach details with related data
    const { data: breach, error: breachError } = await supabase
      .from("platform_sla_breaches")
      .select(`
        *,
        organization:organizations(id, name, subdomain),
        sla_definition:platform_sla_definitions(sla_name, sla_type, target_value, target_unit)
      `)
      .eq("id", breachId)
      .single();

    if (breachError || !breach) {
      return new Response(
        JSON.stringify({ error: "Breach not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get platform admins to notify
    const { data: admins } = await supabase
      .from("platform_admins")
      .select("user_id, profiles:user_id(email, full_name)")
      .eq("is_active", true);

    const adminEmails = admins
      ?.filter(a => a.profiles?.email)
      .map(a => a.profiles.email) || [];

    // Create platform notification for real-time push
    const notifications = admins?.map(admin => ({
      title: `SLA Breach: ${breach.sla_definition?.sla_name}`,
      message: `${breach.organization?.name} has breached the ${breach.sla_definition?.sla_name} SLA. Actual: ${breach.actual_value}, Target: ${breach.target_value}`,
      category: "sla_breach",
      notification_type: "sla_alert",
      priority: breach.severity === "critical" ? "high" : "normal",
      action_url: "/admin/platform/monitoring",
      metadata: { breach_id: breachId, organization_id: breach.organization_id },
      organization_id: breach.organization_id,
      user_id: admin.user_id,
    })) || [];

    if (notifications.length > 0) {
      await supabase.from("admin_notifications").insert(notifications);
    }

    // Send email alerts if Resend is configured
    if (resendApiKey && adminEmails.length > 0) {
      const emailHtml = `
        <h2>SLA Breach Alert</h2>
        <p><strong>Organization:</strong> ${breach.organization?.name}</p>
        <p><strong>SLA:</strong> ${breach.sla_definition?.sla_name}</p>
        <p><strong>Severity:</strong> ${breach.severity}</p>
        <p><strong>Details:</strong></p>
        <ul>
          <li>Actual Value: ${breach.actual_value}</li>
          <li>Target Value: ${breach.target_value} ${breach.sla_definition?.target_unit}</li>
          <li>Breach Started: ${new Date(breach.breach_start).toLocaleString()}</li>
        </ul>
        <p><a href="https://admin.staymoxie.com/admin/platform/monitoring">View in Platform Command Center</a></p>
      `;

      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "StayMoxie Platform <alerts@staymoxie.com>",
          to: adminEmails,
          subject: `[${breach.severity.toUpperCase()}] SLA Breach: ${breach.sla_definition?.sla_name} - ${breach.organization?.name}`,
          html: emailHtml,
        }),
      });

      if (!emailResponse.ok) {
        console.error("Failed to send email:", await emailResponse.text());
      }
    }

    // Update breach as notified
    await supabase
      .from("platform_sla_breaches")
      .update({ notified_at: new Date().toISOString() })
      .eq("id", breachId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        notified_admins: adminEmails.length,
        push_notifications: notifications.length 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending breach alert:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
