
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@6.9.4";
import { decryptApiKey, isEncrypted } from "../_shared/encryption.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PreviewRequest {
  testEmail: string;
  subject: string;
  content: string;
  coverImageUrl?: string;
  organizationId?: string; // Explicit org context from frontend (highest priority)
  linkedContent?: {
    blog_posts: string[];
    events: string[];
    places: string[];
  };
}

const handler = async (req: Request): Promise<Response> => {
  console.log(`[${new Date().toISOString()}] Newsletter preview request: ${req.method}`);
  console.log(`[DEBUG] Request URL: ${req.url}`);
  console.log(`[DEBUG] Request headers:`, Object.fromEntries(req.headers.entries()));
  
  if (req.method === "OPTIONS") {
    console.log("✅ Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🔧 Creating Supabase clients...");
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    console.log("🔐 Authorization header present:", !!authHeader);
    console.log("🔐 Auth header length:", authHeader?.length || 0);
    
    if (!authHeader) {
      console.error("❌ No authorization header provided");
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Authentication required - please log in to send newsletter previews",
          timestamp: new Date().toISOString()
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    console.log("🎫 Token extracted, length:", token.length);
    console.log("🎫 Token preview:", token.substring(0, 20) + "...");

    console.log("🔍 Authenticating user...");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      console.error("❌ Auth error:", authError);
      console.error("❌ User object:", user);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Authentication failed - please log in again",
          details: authError?.message || "No user found",
          timestamp: new Date().toISOString()
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("✅ User authenticated successfully:", user.id, user.email);

    console.log("🔍 Checking admin permissions...");
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("role, organization_id")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("❌ Error fetching user profile:", profileError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Failed to verify admin permissions",
          details: profileError.message,
          timestamp: new Date().toISOString()
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("👤 User profile:", profile);
    if (profile?.role !== "admin") {
      console.error("❌ User is not admin. Role:", profile?.role);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Admin access required",
          userRole: profile?.role || "unknown",
          timestamp: new Date().toISOString()
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("✅ Admin access confirmed");

    console.log("📝 Parsing request body...");
    let requestBody;
    try {
      const bodyText = await req.text();
      console.log("📝 Raw request body:", bodyText);
      
      if (!bodyText || bodyText.trim() === '') {
        throw new Error("Empty request body received");
      }
      
      requestBody = JSON.parse(bodyText);
      console.log("📋 Parsed request body:", requestBody);
    } catch (parseError) {
      console.error("❌ Failed to parse request body:", parseError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Invalid JSON in request body",
          details: parseError.message,
          timestamp: new Date().toISOString()
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const { testEmail, subject, content, coverImageUrl, linkedContent }: PreviewRequest = requestBody;

    console.log("📊 Newsletter data validation:");
    console.log("- Test Email:", testEmail ? `"${testEmail}"` : "MISSING");
    console.log("- Subject:", subject ? `"${subject}" (${subject.length} chars)` : "MISSING");
    console.log("- Content:", content ? `${content.length} characters` : "MISSING");
    console.log("- Cover Image:", coverImageUrl ? "Yes" : "No");

    if (!testEmail || !subject || !content) {
      console.error("❌ Missing required fields:", { 
        testEmail: !!testEmail, 
        subject: !!subject, 
        content: !!content 
      });
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Test email, subject, and content are required",
          missingFields: {
            testEmail: !testEmail,
            subject: !subject,
            content: !content
          },
          timestamp: new Date().toISOString()
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      console.error("❌ Invalid email format:", testEmail);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Please enter a valid email address",
          providedEmail: testEmail,
          timestamp: new Date().toISOString()
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Get user's organization - priority: request body > profile > organization_members
    console.log("🔑 Resolving organization context...");
    
    // Priority 1: Use organizationId from request body (current admin context)
    let organizationId = requestBody.organizationId;
    console.log("📍 organizationId from request:", organizationId || "not provided");
    
    // Priority 2: Fall back to profile's organization_id
    if (!organizationId) {
      const { data: userProfile, error: profileOrgError } = await supabaseAdmin
        .from("profiles")
        .select("organization_id")
        .eq("id", user.id)
        .single();
      
      if (!profileOrgError && userProfile?.organization_id) {
        organizationId = userProfile.organization_id;
        console.log("📍 organizationId from profile:", organizationId);
      }
    }
    
    // Priority 3: Fall back to organization_members (oldest joined)
    if (!organizationId) {
      console.log("📍 Checking organization_members for user:", user.id);
      const { data: membership, error: membershipError } = await supabaseAdmin
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .order("joined_at", { ascending: true })
        .limit(1)
        .single();
      
      if (!membershipError && membership?.organization_id) {
        organizationId = membership.organization_id;
        console.log("📍 organizationId from organization_members:", organizationId);
      }
    }
    
    console.log("✅ Final organizationId resolved:", organizationId || "NONE");

    let resendApiKey = "";
    
    if (organizationId) {
      const { data: orgData, error: orgError } = await supabaseAdmin
        .from("organizations")
        .select("resend_api_key")
        .eq("id", organizationId)
        .single();

      if (!orgError && orgData?.resend_api_key) {
        resendApiKey = orgData.resend_api_key;
        if (isEncrypted(resendApiKey)) {
          resendApiKey = await decryptApiKey(resendApiKey);
        }
        console.log("✅ Using organization's Resend API key");
      }
    }

    // Fallback to global secret if org key not configured
    if (!resendApiKey) {
      resendApiKey = Deno.env.get("RESEND_API_KEY") || "";
      if (resendApiKey) {
        console.log("ℹ️ Using global RESEND_API_KEY as fallback");
      }
    }

    console.log("📧 Checking email service configuration...");
    console.log("📧 Resend API key present:", !!resendApiKey);
    console.log("⚙️ Fetching email settings from database for organization:", organizationId);
    
    let siteSettings: { key: string; value: any }[] = [];
    if (organizationId) {
      const { data, error: settingsError } = await supabaseAdmin
        .from("site_settings")
        .select("key, value")
        .eq("organization_id", organizationId)
        .in("key", [
          "emailFromAddress", "emailFromName", "emailReplyTo", 
          "siteName", "contactEmail", "phone", "address", "socialMedia"
        ]);

      if (settingsError) {
        console.error("⚠️ Error fetching site settings:", settingsError);
      } else {
        siteSettings = data || [];
      }
    } else {
      console.warn("⚠️ No organization_id found for user, using defaults");
    }

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

    console.log("📋 Site settings loaded:", Object.keys(settings));

    const siteName = settings.siteName || "Vacation Rentals";
    const fromEmail = settings.emailFromAddress || settings.contactEmail || "";
    const fromName = settings.emailFromName || siteName;
    const replyTo = settings.emailReplyTo || fromEmail;

    console.log(`📧 Email configuration:`);
    console.log(`- From: ${fromName} <${fromEmail}>`);
    console.log(`- Reply-to: ${replyTo}`);
    console.log(`- Site: ${siteName}`);

    // Validate from email before attempting to send
    if (!fromEmail) {
      console.error("❌ No from email address configured");
      return new Response(
        JSON.stringify({
          success: false,
          error: "Email configuration incomplete: No 'From' email address configured. Please configure your email settings in Admin → Settings → Email Services.",
          timestamp: new Date().toISOString()
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const textContent = content.replace(/<[^>]*>/g, '').trim();
    const preheader = textContent.split('\n')[0]?.trim()?.substring(0, 100) + '...' || `${subject} - Your Eugene adventure awaits!`;

    // Updated email template with modern slate-gray gradient matching the main newsletter
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
              
              ${coverImageUrl ? `
              <div style="width: 100%; overflow: hidden;">
                  <img src="${coverImageUrl}" alt="Newsletter Cover" style="width: 100%; height: 200px; object-fit: cover; display: block;">
              </div>
              ` : ''}
              
              <div class="header">
                  <div class="header-content">
                      <h1>${siteName}</h1>
                      <p>Your latest updates</p>
                  </div>
              </div>
              
              <div class="content">
                  <h2 style="margin-top: 0;">${subject}</h2>
                  <div>${content}</div>
              </div>
              
              <div class="footer">
                  <p><strong>${siteName}</strong></p>
                  <p>${settings.tagline || ''}</p>
                  <p>${settings.address || ''} | ${settings.contactEmail || fromEmail}</p>
                  ${settings.phone ? `<p>Phone: ${settings.phone}</p>` : ''}
                  <div class="social-links">
                      <a href="#">Visit Our Website</a>
                      <a href="#">View Properties</a>
                      ${settings.socialMedia?.facebook ? `<a href="${settings.socialMedia.facebook}">Facebook</a>` : ''}
                      ${settings.socialMedia?.instagram ? `<a href="${settings.socialMedia.instagram}">Instagram</a>` : ''}
                      ${settings.socialMedia?.twitter ? `<a href="${settings.socialMedia.twitter}">Twitter</a>` : ''}
                      ${settings.socialMedia?.googlePlaces ? `<a href="${settings.socialMedia.googlePlaces}">Find Us</a>` : ''}
                  </div>
                  <p style="font-size: 12px;">
                      <a href="#">Unsubscribe</a> | 
                      <a href="#" style="margin-left: 8px;">Update Preferences</a>
                  </p>
              </div>
          </div>
      </body>
      </html>`;

    console.log("📤 Preparing to send newsletter preview...");
    
    let emailResult;
    
    if (resendApiKey) {
      // Use direct Resend API
      console.log("📧 Sending email via direct Resend API...");
      const resend = new Resend(resendApiKey);
      
      try {
        const response = await resend.emails.send({
          from: `${fromName} <${fromEmail}>`,
          to: [testEmail],
          subject: `[PREVIEW] ${subject}`,
          html: emailHtml,
          reply_to: replyTo,
        });

        console.log("📬 Resend response:", response);

        if (response.error) {
          console.error(`❌ Resend API error:`, response.error.message);
          
          // Provide specific guidance based on error type
          let errorMessage = `Email delivery failed: ${response.error.message}`;
          
          if (response.error.message.includes("not verified")) {
            errorMessage = `Email address "${fromEmail}" is not verified in your Resend account. Please verify this email address in your Resend dashboard.`;
          } else if (response.error.message.includes("Invalid API key")) {
            errorMessage = "Invalid Resend API key. Please check your RESEND_API_KEY in Supabase secrets.";
          } else if (response.error.message.includes("domain not found")) {
            errorMessage = `Domain verification required. Please verify your domain in Resend dashboard before sending from "${fromEmail}".`;
          }
          
          return new Response(
            JSON.stringify({ 
              success: false,
              error: errorMessage,
              resendError: response.error,
              timestamp: new Date().toISOString()
            }),
            {
              status: 500,
              headers: { "Content-Type": "application/json", ...corsHeaders },
            }
          );
        }
        
        emailResult = {
          success: true,
          method: "resend_api",
          details: response
        };
        
      } catch (resendError: any) {
        console.error(`❌ Resend API exception:`, resendError.message);
        
        return new Response(
          JSON.stringify({ 
            success: false,
            error: `Resend API error: ${resendError.message}`,
            timestamp: new Date().toISOString()
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
      
    } else {
      // Use Supabase Auth email (simplified approach)
      console.log("📧 Using Supabase integrated email service...");
      
      try {
        // Send a simple notification email using recovery link generation as test
        const { data: emailData, error: emailError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'recovery',
          email: testEmail,
          options: {
            redirectTo: 'https://moxievacationrentals.com'
          }
        });

        if (emailError) {
          console.error(`❌ Supabase email error:`, emailError.message);
          
          return new Response(
            JSON.stringify({ 
              success: false,
              error: `Supabase email service error: ${emailError.message}. Please configure RESEND_API_KEY in secrets for full email functionality.`,
              supabaseError: emailError,
              timestamp: new Date().toISOString()
            }),
            {
              status: 500,
              headers: { "Content-Type": "application/json", ...corsHeaders },
            }
          );
        }
        
        emailResult = {
          success: true,
          method: "supabase_auth",
          note: "Basic email test sent. For full newsletter previews, please configure RESEND_API_KEY."
        };
        
      } catch (supabaseError: any) {
        console.error(`❌ Supabase email exception:`, supabaseError.message);
        
        return new Response(
          JSON.stringify({ 
            success: false,
            error: `Email service error: ${supabaseError.message}`,
            timestamp: new Date().toISOString()
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }
    }

    console.log(`✅ Newsletter preview sent successfully to ${testEmail}`);
    console.log(`📊 Email method used: ${emailResult.method}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: emailResult.method === "resend_api" ? 
          "Newsletter preview sent successfully!" : 
          "Email service test completed! Configure RESEND_API_KEY for full newsletter functionality.",
        details: {
          to: testEmail,
          from: fromEmail,
          fromName: fromName,
          subject: `[PREVIEW] ${subject}`,
          method: emailResult.method,
          timestamp: new Date().toISOString(),
          ...(emailResult.note && { note: emailResult.note })
        }
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("❌ Error in send-newsletter-preview function:", error);
    console.error("❌ Error stack:", error.stack);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || "An unexpected error occurred",
        errorType: error.constructor.name,
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
