
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NewsletterPreviewRequest {
  email: string;
  subject: string;
  content: string;
}

const handler = async (req: Request): Promise<Response> => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] 🚀 Newsletter preview request received: ${req.method}`);
  
  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("📧 Creating Supabase client...");
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    console.log("🔐 Authorization header present:", !!authHeader);
    
    if (!authHeader) {
      console.error("❌ No authorization header provided");
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Authentication required - please log in to send newsletter previews",
          timestamp
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Extract the JWT token from Bearer header
    const token = authHeader.replace("Bearer ", "");
    console.log("🎫 Token extracted, length:", token.length);

    // Verify the token and get user
    console.log("👤 Verifying user authentication...");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      console.error("❌ Auth error:", authError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Authentication failed - please log in again",
          timestamp
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("✅ User authenticated successfully:", user.id, user.email);

    // Parse request body
    console.log("📝 Parsing request body...");
    const requestBody = await req.json();
    console.log("📧 Request body received:", { 
      email: requestBody.email, 
      subject: requestBody.subject,
      contentLength: requestBody.content?.length || 0
    });
    
    const { email, subject, content }: NewsletterPreviewRequest = requestBody;

    if (!email || !subject || !content) {
      console.error("❌ Missing required fields:", { 
        email: !!email, 
        subject: !!subject, 
        content: !!content 
      });
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Email, subject, and content are required",
          timestamp
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("⚙️ Fetching email settings from database...");
    // Fetch email settings from site_settings
    const { data: emailSettings, error: settingsError } = await supabaseClient
      .from("site_settings")
      .select("key, value")
      .in("key", ["emailFromAddress", "emailFromName", "emailReplyTo", "siteName"]);

    if (settingsError) {
      console.error("⚠️ Error fetching email settings:", settingsError);
    }

    // Convert settings array to object
    const settings = emailSettings?.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>) || {};

    console.log("📧 Email settings:", settings);

    // Use configured settings with fallbacks
    const fromEmail = settings.emailFromAddress || "newsletter@moxievacationrentals.com";
    const fromName = settings.emailFromName || settings.siteName || "Moxie Vacation Rentals";
    const replyTo = settings.emailReplyTo || fromEmail;

    console.log("📧 Email configuration:", { fromEmail, fromName, replyTo });

    // Create enhanced newsletter template with the actual content
    const emailHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
              /* Reset styles */
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; }
              
              /* Moxie Brand Colors */
              .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
              .text-primary { color: #1f2937; }
              .text-secondary { color: #6b7280; }
              .text-white { color: #ffffff; }
              .bg-white { background-color: #ffffff; }
              
              /* Layout */
              .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
              .section { padding: 32px 24px; }
              .hero-section { padding: 48px 24px; text-align: center; }
              .footer-section { padding: 32px 24px; background: #f9fafb; }
              
              /* Typography */
              .hero-title { font-size: 32px; font-weight: bold; margin-bottom: 16px; line-height: 1.2; }
              .hero-subtitle { font-size: 18px; opacity: 0.9; margin-bottom: 24px; }
              .content-text { font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 16px; }
              
              /* Components */
              .button { 
                  display: inline-block; 
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                  color: white; 
                  padding: 14px 28px; 
                  text-decoration: none; 
                  border-radius: 8px; 
                  font-weight: 600;
                  margin: 16px 0;
              }
              
              /* Mobile responsive */
              @media (max-width: 600px) {
                  .hero-title { font-size: 28px; }
                  .section { padding: 24px 16px; }
                  .hero-section { padding: 32px 16px; }
              }
          </style>
      </head>
      <body>
          <div class="container">
              <!-- Newsletter Preview Header -->
              <div style="background: #f3f4f6; padding: 12px 24px; text-align: center; border-bottom: 1px solid #e5e7eb;">
                  <p style="margin: 0; font-size: 14px; color: #6b7280;">📧 Newsletter Preview - This is how your email will look</p>
              </div>
              
              <!-- Moxie Header -->
              <div class="gradient-bg hero-section">
                  <div class="text-white">
                      <h1 class="hero-title">${fromName}</h1>
                      <p class="hero-subtitle">Your Home Base for Living Like a Local in Eugene</p>
                  </div>
              </div>
              
              <!-- Main Content -->
              <div class="section">
                  <h2 style="font-size: 24px; font-weight: bold; margin-bottom: 16px; color: #1f2937;">${subject}</h2>
                  
                  <div class="content-text">
                      ${content}
                  </div>
              </div>
              
              <!-- Footer -->
              <div class="footer-section">
                  <div style="text-align: center; color: #6b7280; font-size: 14px;">
                      <p style="margin-bottom: 16px;"><strong>${fromName}</strong></p>
                      <p style="margin-bottom: 12px;">Your Home Base for Living Like a Local in Eugene</p>
                      <p style="margin-bottom: 16px;">Eugene, Oregon | ${fromEmail}</p>
                      <div style="margin-bottom: 16px;">
                          <a href="#" style="color: #667eea; text-decoration: none; margin: 0 8px;">Visit Our Website</a>
                          <a href="#" style="color: #667eea; text-decoration: none; margin: 0 8px;">View Properties</a>
                      </div>
                      <p style="font-size: 12px; color: #9ca3af;">
                          <a href="#" style="color: #9ca3af; text-decoration: none;">Unsubscribe</a> | 
                          <a href="#" style="color: #9ca3af; text-decoration: none; margin-left: 8px;">Update Preferences</a>
                      </p>
                  </div>
              </div>
          </div>
      </body>
      </html>`;

    // Send email using SendGrid
    const sendGridApiKey = Deno.env.get("SENDGRID_API_KEY");
    console.log("📧 SendGrid API key present:", !!sendGridApiKey);
    
    if (!sendGridApiKey) {
      console.error("❌ SendGrid API key not found in environment");
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Email service not configured. Please contact administrator.",
          timestamp
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("📤 Preparing to send newsletter preview via SendGrid...");
    const sendGridPayload = {
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
    };

    console.log("📧 SendGrid payload prepared for newsletter preview");

    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${sendGridApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sendGridPayload),
    });

    console.log("📬 SendGrid response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ SendGrid API error (${response.status}):`, errorText);
      
      let errorMessage = `Email delivery failed: ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.errors && errorData.errors.length > 0) {
          errorMessage += ` - ${errorData.errors[0].message}`;
        }
      } catch (e) {
        errorMessage += ` - ${errorText}`;
      }
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: errorMessage,
          timestamp
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`✅ Newsletter preview sent successfully to ${email} from ${fromEmail}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Newsletter preview sent successfully!", 
        details: {
          to: email,
          from: fromEmail,
          fromName: fromName,
          subject: `[PREVIEW] ${subject}`,
          timestamp
        }
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("❌ Error in send-newsletter-preview-actual function:", error);
    console.error("❌ Error stack:", error.stack);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || "An unexpected error occurred",
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
