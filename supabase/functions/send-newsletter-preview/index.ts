
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PreviewRequest {
  email: string;
  subject: string;
  content: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Check if user is admin
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      throw new Error("Admin access required");
    }

    const { email, subject, content }: PreviewRequest = await req.json();

    if (!email || !subject || !content) {
      throw new Error("Email, subject, and content are required");
    }

    // Fetch email settings from site_settings
    const { data: emailSettings, error: settingsError } = await supabaseClient
      .from("site_settings")
      .select("key, value")
      .in("key", ["emailFromAddress", "emailFromName", "emailReplyTo", "siteName"]);

    if (settingsError) {
      console.error("Error fetching email settings:", settingsError);
    }

    // Convert settings array to object
    const settings = emailSettings?.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>) || {};

    // Use configured settings with fallbacks
    const fromEmail = settings.emailFromAddress || "noreply@moxievacationrentals.com";
    const fromName = settings.emailFromName || settings.siteName || "Moxie Vacation Rentals";
    const replyTo = settings.emailReplyTo || fromEmail;

    // Create email template
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">${fromName}</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Newsletter Preview</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px; margin-bottom: 20px; text-align: center;">
              <strong>⚠️ THIS IS A PREVIEW EMAIL ⚠️</strong><br>
              This is a test version of your newsletter content.
            </div>
            
            <h2 style="color: #333; margin-top: 0;">${subject}</h2>
            
            <div style="margin: 20px 0;">
              ${content}
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
              <p style="margin: 0; color: #666; font-size: 14px;">
                Thanks for subscribing to ${fromName}!
              </p>
              <p style="margin: 10px 0 0 0; color: #666; font-size: 12px;">
                This was a preview email sent from the newsletter manager.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email using SendGrid
    const sendGridApiKey = Deno.env.get("SENDGRID_API_KEY");
    if (!sendGridApiKey) {
      throw new Error("SendGrid API key not configured");
    }

    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${sendGridApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: email }],
            subject: `[PREVIEW] ${subject}`,
          },
        ],
        from: { email: fromEmail, name: fromName },
        reply_to: { email: replyTo },
        content: [
          {
            type: "text/html",
            value: emailHtml,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to send preview email:`, errorText);
      throw new Error(`SendGrid API error: ${response.status}`);
    }

    console.log(`Preview newsletter sent successfully to ${email} from ${fromEmail}`);

    return new Response(
      JSON.stringify({ 
        message: "Preview sent successfully", 
        email: email,
        fromEmail: fromEmail
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in send-newsletter-preview function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
