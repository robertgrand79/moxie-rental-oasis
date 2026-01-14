import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CleanupResult {
  platform_audit_logs_deleted: number;
  security_audit_logs_deleted: number;
  impersonation_sessions_deleted: number;
  error_logs_deleted: number;
  application_logs_deleted: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse optional retention days from request body
    let platformRetentionDays = 90;
    let securityRetentionDays = 90;
    let securityLowRiskRetentionDays = 30;
    let impersonationRetentionDays = 180;
    let errorLogRetentionDays = 30;
    let appLogRetentionDays = 30;

    if (req.method === "POST") {
      try {
        const body = await req.json();
        if (body.platform_retention_days) platformRetentionDays = body.platform_retention_days;
        if (body.security_retention_days) securityRetentionDays = body.security_retention_days;
        if (body.security_low_risk_retention_days) securityLowRiskRetentionDays = body.security_low_risk_retention_days;
        if (body.impersonation_retention_days) impersonationRetentionDays = body.impersonation_retention_days;
        if (body.error_log_retention_days) errorLogRetentionDays = body.error_log_retention_days;
        if (body.app_log_retention_days) appLogRetentionDays = body.app_log_retention_days;
      } catch {
        // Use defaults if body parsing fails
      }
    }

    const results: CleanupResult = {
      platform_audit_logs_deleted: 0,
      security_audit_logs_deleted: 0,
      impersonation_sessions_deleted: 0,
      error_logs_deleted: 0,
      application_logs_deleted: 0,
    };

    // 1. Delete old platform admin audit logs (90 days default)
    const platformCutoff = new Date();
    platformCutoff.setDate(platformCutoff.getDate() - platformRetentionDays);
    
    const { data: platformDeleted, error: platformError } = await supabase
      .from("platform_admin_audit_logs")
      .delete()
      .lt("created_at", platformCutoff.toISOString())
      .select("id");

    if (platformError) {
      console.error("Error deleting platform audit logs:", platformError);
    } else {
      results.platform_audit_logs_deleted = platformDeleted?.length || 0;
    }

    // 2. Delete old security audit logs
    // Low risk: 30 days, Medium/High/Critical: 90 days
    const lowRiskCutoff = new Date();
    lowRiskCutoff.setDate(lowRiskCutoff.getDate() - securityLowRiskRetentionDays);
    
    const securityCutoff = new Date();
    securityCutoff.setDate(securityCutoff.getDate() - securityRetentionDays);

    // Delete low-risk logs older than 30 days
    const { data: securityLowDeleted } = await supabase
      .from("security_audit_logs")
      .delete()
      .eq("risk_level", "low")
      .lt("created_at", lowRiskCutoff.toISOString())
      .select("id");

    // Delete all other logs older than 90 days
    const { data: securityOtherDeleted } = await supabase
      .from("security_audit_logs")
      .delete()
      .neq("risk_level", "low")
      .lt("created_at", securityCutoff.toISOString())
      .select("id");

    results.security_audit_logs_deleted = 
      (securityLowDeleted?.length || 0) + (securityOtherDeleted?.length || 0);

    // 3. Delete old impersonation sessions (180 days default)
    const impersonationCutoff = new Date();
    impersonationCutoff.setDate(impersonationCutoff.getDate() - impersonationRetentionDays);

    const { data: impersonationDeleted } = await supabase
      .from("admin_impersonation_sessions")
      .delete()
      .lt("started_at", impersonationCutoff.toISOString())
      .select("id");

    results.impersonation_sessions_deleted = impersonationDeleted?.length || 0;

    // 4. Delete old error logs (30 days default)
    const errorLogCutoff = new Date();
    errorLogCutoff.setDate(errorLogCutoff.getDate() - errorLogRetentionDays);

    const { data: errorLogsDeleted } = await supabase
      .from("error_logs")
      .delete()
      .lt("created_at", errorLogCutoff.toISOString())
      .select("id");

    results.error_logs_deleted = errorLogsDeleted?.length || 0;

    // 5. Delete old application logs (30 days default)
    const appLogCutoff = new Date();
    appLogCutoff.setDate(appLogCutoff.getDate() - appLogRetentionDays);

    const { data: appLogsDeleted } = await supabase
      .from("application_logs")
      .delete()
      .lt("created_at", appLogCutoff.toISOString())
      .select("id");

    results.application_logs_deleted = appLogsDeleted?.length || 0;

    // Log the cleanup operation
    await supabase.from("application_logs").insert({
      level: "info",
      message: "Audit log cleanup completed",
      context: {
        results,
        retention_settings: {
          platform_retention_days: platformRetentionDays,
          security_retention_days: securityRetentionDays,
          security_low_risk_retention_days: securityLowRiskRetentionDays,
          impersonation_retention_days: impersonationRetentionDays,
          error_log_retention_days: errorLogRetentionDays,
          app_log_retention_days: appLogRetentionDays,
        },
      },
      tags: ["audit", "cleanup", "maintenance"],
    });

    console.log("Cleanup completed:", results);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Audit log cleanup completed",
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Cleanup error:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
