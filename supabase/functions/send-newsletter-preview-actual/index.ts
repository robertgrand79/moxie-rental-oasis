import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

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
  console.log(`[${timestamp}] 🚀 Newsletter preview function called: ${req.method}`);
  
  if (req.method === "OPTIONS") {
    console.log("✅ Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create admin client for database operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Create regular client for user authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
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

    // Extract and verify JWT token using regular client
    const token = authHeader.replace("Bearer ", "");
    console.log("🎫 Token extracted, length:", token.length);

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

    // Check if user is admin using admin client to avoid RLS issues
    console.log("🔍 Checking admin permissions...");
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Error fetching user profile:", profileError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Failed to verify admin permissions",
          timestamp
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (profile?.role !== "admin") {
      console.error("User is not admin. Role:", profile?.role);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Admin access required",
          timestamp
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("✅ Admin access confirmed");

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

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error("❌ Invalid email format:", email);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Please enter a valid email address",
          timestamp
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Check Resend API key
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    console.log("📧 Resend API key present:", !!resendApiKey);
    
    if (!resendApiKey) {
      console.error("❌ Resend API key not found");
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Email service not configured. Please add RESEND_API_KEY to your Supabase secrets.",
          timestamp
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const resend = new Resend(resendApiKey);

    console.log("⚙️ Fetching email settings from database...");
    // Fetch all email and contact settings from site_settings
    const { data: siteSettings, error: settingsError } = await supabaseAdmin
      .from("site_settings")
      .select("key, value")
      .in("key", [
        "emailFromAddress", "emailFromName", "emailReplyTo", 
        "siteName", "contactEmail", "phone", "address", "socialMedia"
      ]);

    if (settingsError) {
      console.error("⚠️ Error fetching site settings:", settingsError);
    }

    // Convert settings array to object with proper parsing
    const settings = siteSettings?.reduce((acc, setting) => {
      if (setting.key === 'socialMedia') {
        try {
          acc[setting.key] = typeof setting.value === 'string' 
            ? JSON.parse(setting.value) 
            : setting.value;
        } catch (parseError) {
          console.warn(`Failed to parse socialMedia setting:`, parseError);
          acc[setting.key] = setting.value;
        }
      } else {
        acc[setting.key] = setting.value;
      }
      return acc;
    }, {} as Record<string, any>) || {};

    console.log("📧 Site settings loaded:", Object.keys(settings));

    // Use configured settings with fallbacks
    const siteName = settings.siteName || "Moxie Vacation Rentals";
    const fromEmail = settings.emailFromAddress || settings.contactEmail || "noreply@moxievacationrentals.com";
    const fromName = settings.emailFromName || siteName;
    const replyTo = settings.emailReplyTo || fromEmail;
    const contactEmail = settings.contactEmail || fromEmail;
    const phone = settings.phone || "+1 (555) 123-4567";
    const address = settings.address || "123 Vacation St, Eugene, OR 97401";
    const socialMedia = settings.socialMedia || {
      facebook: '',
      instagram: '',
      twitter: '',
      googlePlaces: ''
    };

    console.log("📧 Email configuration:", { fromEmail, fromName, replyTo });

    // Generate preheader from content
    const textContent = content.replace(/<[^>]*>/g, '').trim();
    const preheader = textContent.split('\n')[0]?.trim()?.substring(0, 100) + '...' || `${subject} - Your Eugene adventure awaits!`;

    // Create newsletter template with updated modern slate-gray header
    const emailHtml = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
              body { 
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                  line-height: 1.6; 
                  margin: 0; 
                  padding: 0; 
                  background-color: #f8fafc;
              }
              .container { 
                  max-width: 600px; 
                  margin: 0 auto; 
                  background: #ffffff; 
                  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              }
              .preview-banner {
                  background: #3b82f6;
                  color: white;
                  text-align: center;
                  padding: 8px 16px;
                  font-size: 14px;
                  font-weight: 500;
              }
              .header { 
                  background: linear-gradient(135deg, hsl(220, 8%, 85%) 0%, hsl(220, 3%, 97%) 100%);
                  position: relative;
                  overflow: hidden;
                  padding: 40px 30px; 
                  text-align: center; 
              }
              .header::before {
                  content: '';
                  position: absolute;
                  top: 0;
                  left: 0;
                  right: 0;
                  bottom: 0;
                  background: linear-gradient(45deg, transparent 0%, hsl(220, 6%, 88%) 50%, transparent 100%);
                  opacity: 0.3;
              }
              .header-content {
                  position: relative;
                  z-index: 10;
              }
              .header h1 { 
                  margin: 0 0 12px 0; 
                  font-size: 28px; 
                  font-weight: bold; 
                  color: hsl(222.2, 47.4%, 11.2%);
              }
              .header p { 
                  margin: 0; 
                  font-size: 16px; 
                  font-weight: 500;
                  color: hsl(215.4, 16.3%, 46.9%);
              }
              .content { 
                  padding: 30px; 
              }
              .content h2 { 
                  color: #333; 
                  font-size: 24px; 
                  margin-bottom: 16px; 
              }
              .content h3 { 
                  color: #333; 
                  font-size: 20px; 
                  margin-bottom: 12px; 
              }
              .content p { 
                  color: #666; 
                  line-height: 1.6; 
                  margin-bottom: 16px; 
              }
              .content ul, .content ol { 
                  color: #666; 
                  padding-left: 20px; 
                  margin-bottom: 16px; 
              }
              .content li { 
                  margin-bottom: 8px; 
              }
              .content strong { 
                  color: #333; 
              }
              .content a { 
                  color: hsl(222.2, 47.4%, 11.2%); 
                  text-decoration: none; 
              }
              .content a:hover { 
                  text-decoration: underline; 
              }
              .footer { 
                  background: #f8fafc; 
                  padding: 30px; 
                  text-align: center; 
                  border-top: 1px solid #e2e8f0; 
              }
              .footer p { 
                  margin: 0 0 10px 0; 
                  color: #666; 
                  font-size: 14px; 
              }
              .footer a { 
                  color: hsl(222.2, 47.4%, 11.2%); 
                  text-decoration: none; 
                  margin: 0 8px; 
              }
              .social-links {
                  margin: 16px 0;
              }
              .social-links a {
                  display: inline-block;
                  margin: 0 8px;
                  color: hsl(222.2, 47.4%, 11.2%);
                  text-decoration: none;
              }
              @media (max-width: 600px) {
                  .header { padding: 30px 20px; }
                  .header h1 { font-size: 24px; }
                  .content { padding: 20px; }
                  .footer { padding: 20px; }
              }
          </style>
      </head>
      <body>
          <div class="container">
              ${preheader ? `<div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">${preheader}</div>` : ''}
              
              <div class="preview-banner">
                  📧 NEWSLETTER PREVIEW - This is exactly what subscribers will receive
              </div>
              
              <div class="header">
                  <div class="header-content">
                      <h1>${siteName}</h1>
                      <p>Your Home Base for Living Like a Local in Eugene</p>
                  </div>
              </div>
              
              <div class="content">
                  <h2 style="margin-top: 0;">${subject}</h2>
                  <div>${content}</div>
              </div>
              
              <div class="footer">
                  <p><strong>${siteName}</strong></p>
                  <p>Your Home Base for Living Like a Local in Eugene</p>
                  <p>${address} | ${contactEmail}</p>
                  ${phone ? `<p>Phone: ${phone}</p>` : ''}
                  <div class="social-links">
                      <a href="https://moxievacationrentals.com">Visit Our Website</a>
                      <a href="https://moxievacationrentals.com">View Properties</a>
                      ${socialMedia?.facebook ? `<a href="${socialMedia.facebook}">Facebook</a>` : ''}
                      ${socialMedia?.instagram ? `<a href="${socialMedia.instagram}">Instagram</a>` : ''}
                      ${socialMedia?.twitter ? `<a href="${socialMedia.twitter}">Twitter</a>` : ''}
                      ${socialMedia?.googlePlaces ? `<a href="${socialMedia.googlePlaces}">Find Us</a>` : ''}
                  </div>
                  <p style="font-size: 12px;">
                      <a href="#">Unsubscribe</a> | 
                      <a href="#" style="margin-left: 8px;">Update Preferences</a>
                  </p>
              </div>
          </div>
      </body>
      </html>`;

    console.log("📤 Preparing to send newsletter preview via Resend...");
    console.log("📧 Sending email via Resend...");

    const response = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: [email],
      subject: `[PREVIEW] ${subject}`,
      html: emailHtml,
      reply_to: replyTo,
    });

    console.log("📬 Resend response:", response);

    if (response.error) {
      console.error(`❌ Resend API error:`, response.error.message);
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: `Email delivery failed: ${response.error.message}`,
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
