
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NewsletterRequest {
  blogPostId?: string;
  subject: string;
  content: string;
  previewText?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
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
    if (!authHeader) {
      console.error("No authorization header provided");
      throw new Error("No authorization header");
    }

    console.log("🔐 Authenticating user...");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      console.error("Authentication failed:", authError);
      throw new Error("Unauthorized");
    }

    console.log("✅ User authenticated:", user.email);

    // Check if user is admin using the admin client to avoid RLS issues
    console.log("🔍 Checking admin permissions...");
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Error fetching user profile:", profileError);
      throw new Error("Failed to verify admin permissions");
    }

    if (profile?.role !== "admin") {
      console.error("User is not admin. Role:", profile?.role);
      throw new Error("Admin access required");
    }

    console.log("✅ Admin access confirmed");

    const { blogPostId, subject, content, previewText }: NewsletterRequest = await req.json();

    if (!subject || !content) {
      throw new Error("Subject and content are required");
    }

    console.log("📧 Getting active subscribers...");
    // Get active subscribers using admin client
    const { data: subscribers, error: subscribersError } = await supabaseAdmin
      .from("newsletter_subscribers")
      .select("email, name")
      .eq("is_active", true);

    if (subscribersError) {
      console.error("Error fetching subscribers:", subscribersError);
      throw subscribersError;
    }

    if (!subscribers || subscribers.length === 0) {
      console.log("⚠️  No active subscribers found");
      return new Response(
        JSON.stringify({ error: "No active subscribers found" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`📬 Found ${subscribers.length} active subscribers`);

    // Fetch all email and contact settings from site_settings
    console.log("⚙️ Fetching site settings...");
    const { data: siteSettings, error: settingsError } = await supabaseAdmin
      .from("site_settings")
      .select("key, value")
      .in("key", [
        "emailFromAddress", "emailFromName", "emailReplyTo", 
        "siteName", "contactEmail", "phone", "address", "socialMedia"
      ]);

    if (settingsError) {
      console.error("Error fetching site settings:", settingsError);
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

    console.log("📋 Site settings loaded:", Object.keys(settings));

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

    console.log(`📤 Sending from: ${fromName} <${fromEmail}>`);
    console.log(`📞 Contact info: ${contactEmail} | ${phone}`);

    // Generate preheader from content
    const textContent = content.replace(/<[^>]*>/g, '').trim();
    const preheader = textContent.split('\n')[0]?.trim()?.substring(0, 100) + '...' || `${subject} - Your Eugene adventure awaits!`;

    // Create email template that uses dynamic contact information
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
              .header { 
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                  color: white; 
                  padding: 40px 30px; 
                  text-align: center; 
              }
              .header h1 { 
                  margin: 0 0 10px 0; 
                  font-size: 28px; 
                  font-weight: bold; 
              }
              .header p { 
                  margin: 0; 
                  opacity: 0.9; 
                  font-size: 16px; 
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
                  color: #667eea; 
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
                  color: #667eea; 
                  text-decoration: none; 
                  margin: 0 8px; 
              }
              .social-links {
                  margin: 16px 0;
              }
              .social-links a {
                  display: inline-block;
                  margin: 0 8px;
                  color: #667eea;
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
              
              <div class="header">
                  <h1>${siteName}</h1>
                  <p>Your Home Base for Living Like a Local in Eugene</p>
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
                      <a href="{{unsubscribe_url}}">Unsubscribe</a> | 
                      <a href="https://moxievacationrentals.com" style="margin-left: 8px;">Update Preferences</a>
                  </p>
              </div>
          </div>
      </body>
      </html>
    `;

    // Send emails using SendGrid
    const sendGridApiKey = Deno.env.get("SENDGRID_API_KEY");
    if (!sendGridApiKey) {
      console.error("❌ SendGrid API key not configured");
      throw new Error("SendGrid API key not configured. Please add SENDGRID_API_KEY to your Supabase secrets.");
    }

    console.log("🚀 Sending emails via SendGrid...");

    const emailPromises = subscribers.map(async (subscriber, index) => {
      console.log(`📧 Sending email ${index + 1}/${subscribers.length} to ${subscriber.email}`);
      
      const personalizedHtml = emailHtml.replace(
        "{{unsubscribe_url}}",
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/unsubscribe-newsletter?email=${encodeURIComponent(subscriber.email)}`
      );

      const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${sendGridApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: subscriber.email, name: subscriber.name || subscriber.email }],
              subject: subject,
            },
          ],
          from: { email: fromEmail, name: fromName },
          reply_to: { email: replyTo },
          content: [
            {
              type: "text/html",
              value: personalizedHtml,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Failed to send email to ${subscriber.email}:`, errorText);
        throw new Error(`SendGrid API error for ${subscriber.email}: ${response.status} - ${errorText}`);
      }

      console.log(`✅ Email sent successfully to ${subscriber.email}`);
      return response;
    });

    await Promise.all(emailPromises);

    console.log("💾 Saving campaign record...");
    // Save campaign record using admin client
    const { error: campaignError } = await supabaseAdmin
      .from("newsletter_campaigns")
      .insert({
        blog_post_id: blogPostId,
        subject,
        content,
        sent_at: new Date().toISOString(),
        recipient_count: subscribers.length,
      });

    if (campaignError) {
      console.error("Failed to save campaign:", campaignError);
    }

    console.log(`🎉 Newsletter sent successfully to ${subscribers.length} subscribers from ${fromEmail}`);

    return new Response(
      JSON.stringify({ 
        message: "Newsletter sent successfully", 
        recipientCount: subscribers.length,
        fromEmail: fromEmail,
        fromName: siteName,
        contactInfo: {
          email: contactEmail,
          phone: phone,
          address: address
        },
        success: true
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("❌ Error in send-newsletter function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false,
        details: "Check the function logs for more information"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
