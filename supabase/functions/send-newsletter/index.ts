
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
            <h1 style="margin: 0; font-size: 28px;">Moxie Travel Blog</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Your travel inspiration delivered</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">${subject}</h2>
            
            <div style="margin: 20px 0;">
              ${content}
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
              <p style="margin: 0; color: #666; font-size: 14px;">
                Thanks for subscribing to Moxie Travel Blog!
              </p>
              <p style="margin: 10px 0 0 0; color: #666; font-size: 12px;">
                <a href="{{unsubscribe_url}}" style="color: #666;">Unsubscribe</a> | 
                <a href="${Deno.env.get("SUPABASE_URL")?.replace('.supabase.co', '') || ''}" style="color: #666;">Visit our blog</a>
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
          from: { email: "noreply@yourdomain.com", name: "Moxie Travel Blog" },
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

    console.log(`Newsletter sent successfully to ${subscribers.length} subscribers`);

    return new Response(
      JSON.stringify({ 
        message: "Newsletter sent successfully", 
        recipientCount: subscribers.length 
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
