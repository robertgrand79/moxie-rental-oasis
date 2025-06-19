
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

    const { blogPostId, subject, content, previewText }: NewsletterRequest = await req.json();

    // Get active subscribers
    const { data: subscribers, error: subscribersError } = await supabaseClient
      .from("newsletter_subscribers")
      .select("email, name")
      .eq("is_active", true);

    if (subscribersError) {
      throw subscribersError;
    }

    if (!subscribers || subscribers.length === 0) {
      return new Response(
        JSON.stringify({ error: "No active subscribers found" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
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

    // Generate preheader from content
    const textContent = content.replace(/<[^>]*>/g, '').trim();
    const preheader = textContent.split('\n')[0]?.trim()?.substring(0, 100) + '...' || `${subject} - Your Eugene adventure awaits!`;

    // Create email template that matches the preview
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
                  <h1>${fromName}</h1>
                  <p>Your Home Base for Living Like a Local in Eugene</p>
              </div>
              
              <div class="content">
                  <h2 style="margin-top: 0;">${subject}</h2>
                  <div>${content}</div>
              </div>
              
              <div class="footer">
                  <p><strong>${fromName}</strong></p>
                  <p>Your Home Base for Living Like a Local in Eugene</p>
                  <p>Eugene, Oregon | contact@moxievacationrentals.com</p>
                  <div style="margin: 16px 0;">
                      <a href="https://moxievacationrentals.com">Visit Our Website</a>
                      <a href="https://moxievacationrentals.com">View Properties</a>
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
      throw new Error("SendGrid API key not configured");
    }

    const emailPromises = subscribers.map(async (subscriber) => {
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
        console.error(`Failed to send email to ${subscriber.email}:`, errorText);
        throw new Error(`SendGrid API error: ${response.status}`);
      }

      return response;
    });

    await Promise.all(emailPromises);

    // Save campaign record
    const { error: campaignError } = await supabaseClient
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

    console.log(`Newsletter sent successfully to ${subscribers.length} subscribers from ${fromEmail}`);

    return new Response(
      JSON.stringify({ 
        message: "Newsletter sent successfully", 
        recipientCount: subscribers.length,
        fromEmail: fromEmail
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in send-newsletter function:", error);
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
