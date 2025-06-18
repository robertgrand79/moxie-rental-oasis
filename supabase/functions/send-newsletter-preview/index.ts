
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
  console.log(`[${new Date().toISOString()}] Request received: ${req.method}`);
  
  if (req.method === "OPTIONS") {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Creating Supabase client...");
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    console.log("Authorization header present:", !!authHeader);
    
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "No authorization header provided",
          timestamp: new Date().toISOString()
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Extract the JWT token from Bearer header
    const token = authHeader.replace("Bearer ", "");
    console.log("Token extracted, length:", token.length);

    // Verify the token and get user
    console.log("Verifying user authentication...");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError) {
      console.error("Auth error:", authError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Authentication failed: " + authError.message,
          timestamp: new Date().toISOString()
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (!user) {
      console.error("No user found from token");
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "No user found from authentication token",
          timestamp: new Date().toISOString()
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("User authenticated successfully:", user.id, user.email);

    // Check if user is admin using service role key for bypassing RLS
    console.log("Checking user role...");
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("role, email")
      .eq("id", user.id)
      .single();

    if (profileError) {
      console.error("Profile fetch error:", profileError);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Failed to fetch user profile: " + profileError.message,
          timestamp: new Date().toISOString()
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("User profile found:", { id: user.id, email: profile?.email, role: profile?.role });

    if (profile?.role !== "admin") {
      console.error("User is not admin, role:", profile?.role);
      return new Response(
        JSON.stringify({ 
          success: false,
          error: `Admin access required. Current role: ${profile?.role || 'unknown'}`,
          timestamp: new Date().toISOString()
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Admin access confirmed for user:", user.email);

    // Parse request body
    console.log("Parsing request body...");
    const requestBody = await req.json();
    console.log("Request body received:", { email: requestBody.email, subject: requestBody.subject });
    
    const { email, subject, content }: PreviewRequest = requestBody;

    if (!email || !subject || !content) {
      console.error("Missing required fields:", { email: !!email, subject: !!subject, content: !!content });
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "Email, subject, and content are required",
          timestamp: new Date().toISOString()
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Fetching email settings from database...");
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

    console.log("Email settings:", settings);

    // Use configured settings with fallbacks
    const fromEmail = settings.emailFromAddress || "noreply@moxievacationrentals.com";
    const fromName = settings.emailFromName || settings.siteName || "Moxie Vacation Rentals";
    const replyTo = settings.emailReplyTo || fromEmail;

    console.log("Email configuration:", { fromEmail, fromName, replyTo });

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
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Email Configuration Test</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 5px; margin-bottom: 20px; text-align: center;">
              <strong>✅ TEST EMAIL SUCCESSFUL ✅</strong><br>
              Your SendGrid configuration is working correctly!
            </div>
            
            <h2 style="color: #333; margin-top: 0;">${subject}</h2>
            
            <div style="margin: 20px 0;">
              ${content}
            </div>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #333;">Configuration Details:</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li><strong>From Name:</strong> ${fromName}</li>
                <li><strong>From Email:</strong> ${fromEmail}</li>
                <li><strong>Reply-To:</strong> ${replyTo}</li>
                <li><strong>Domain:</strong> ${fromEmail.split('@')[1]}</li>
                <li><strong>Test Date:</strong> ${new Date().toLocaleString()}</li>
              </ul>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
              <p style="margin: 0; color: #666; font-size: 14px;">
                This test email confirms your SendGrid integration is properly configured.
              </p>
              <p style="margin: 10px 0 0 0; color: #666; font-size: 12px;">
                If you received this email, your domain verification and email settings are working correctly!
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email using SendGrid
    const sendGridApiKey = Deno.env.get("SENDGRID_API_KEY");
    console.log("SendGrid API key present:", !!sendGridApiKey);
    
    if (!sendGridApiKey) {
      console.error("SendGrid API key not found in environment");
      return new Response(
        JSON.stringify({ 
          success: false,
          error: "SendGrid API key not configured. Please add SENDGRID_API_KEY to your environment variables.",
          timestamp: new Date().toISOString()
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Preparing to send email via SendGrid...");
    const sendGridPayload = {
      personalizations: [
        {
          to: [{ email: email }],
          subject: `[TEST] ${subject} - Domain Verification`,
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

    console.log("SendGrid payload:", JSON.stringify(sendGridPayload, null, 2));

    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${sendGridApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sendGridPayload),
    });

    console.log("SendGrid response status:", response.status);
    console.log("SendGrid response headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`SendGrid API error (${response.status}):`, errorText);
      
      let errorMessage = `SendGrid API error: ${response.status}`;
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
          timestamp: new Date().toISOString()
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const responseText = await response.text();
    console.log("SendGrid response body:", responseText);

    console.log(`✅ Test email sent successfully to ${email} from ${fromEmail}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Test email sent successfully!", 
        details: {
          to: email,
          from: fromEmail,
          fromName: fromName,
          replyTo: replyTo,
          domain: fromEmail.split('@')[1],
          timestamp: new Date().toISOString()
        }
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("❌ Error in send-newsletter-preview function:", error);
    console.error("Error stack:", error.stack);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
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
