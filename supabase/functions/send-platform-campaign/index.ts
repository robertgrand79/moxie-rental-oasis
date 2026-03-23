import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@6.9.4";

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
    
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    // Verify caller is platform admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Unauthorized");

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    
    if (!profile || !["platform_admin", "super_admin"].includes(profile.role)) {
      throw new Error("Only platform admins can send campaigns");
    }

    const { announcementId } = await req.json();
    if (!announcementId) throw new Error("announcementId required");

    // Get the announcement
    const { data: announcement, error: annError } = await supabase
      .from("platform_announcements")
      .select("*")
      .eq("id", announcementId)
      .single();

    if (annError || !announcement) throw new Error("Announcement not found");
    if (announcement.announcement_type !== "campaign") throw new Error("Not a campaign");
    if (announcement.email_sent_at) throw new Error("Campaign already sent");

    // Get target organizations
    let orgQuery = supabase
      .from("organizations")
      .select("id, name, slug, subscription_tier");
    
    if (announcement.target_tiers && announcement.target_tiers.length > 0) {
      orgQuery = orgQuery.in("subscription_tier", announcement.target_tiers);
    }

    const { data: orgs, error: orgsError } = await orgQuery;
    if (orgsError) throw orgsError;

    // Get owner emails for each org
    let sentCount = 0;
    const errors: string[] = [];

    for (const org of orgs || []) {
      const { data: owner } = await supabase
        .from("profiles")
        .select("email, first_name")
        .eq("organization_id", org.id)
        .eq("role", "admin")
        .limit(1)
        .single();

      if (!owner?.email) continue;

      try {
        await resend.emails.send({
          from: "StayMoxie <platform@staymoxie.com>",
          to: [owner.email],
          subject: announcement.email_subject || announcement.title,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #1a1a1a;">${announcement.title}</h1>
              <div style="color: #4a4a4a; line-height: 1.6;">
                ${announcement.content.replace(/\n/g, '<br>')}
              </div>
              ${announcement.cta_text && announcement.cta_url ? `
                <p style="margin-top: 24px;">
                  <a href="${announcement.cta_url}" style="background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
                    ${announcement.cta_text}
                  </a>
                </p>
              ` : ''}
              <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;">
              <p style="color: #888; font-size: 12px;">
                This email was sent to ${org.name} by the StayMoxie Platform.
              </p>
            </div>
          `,
        });
        sentCount++;
      } catch (e) {
        console.error(`Failed to send to ${owner.email}:`, e);
        errors.push(owner.email);
      }
    }

    // Update announcement with sent info
    await supabase
      .from("platform_announcements")
      .update({
        email_sent_at: new Date().toISOString(),
        email_sent_count: sentCount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", announcementId);

    return new Response(
      JSON.stringify({ success: true, sent_count: sentCount, errors }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Campaign send error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
