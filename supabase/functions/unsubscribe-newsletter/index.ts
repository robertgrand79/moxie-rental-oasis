import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const email = url.searchParams.get("email");
    const token = url.searchParams.get("token");
    const orgId = url.searchParams.get("org");

    if (!email) {
      return new Response(
        generateHtmlPage("Error", "Email address is required.", false),
        { headers: { ...corsHeaders, "Content-Type": "text/html" }, status: 400 }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find and update the subscriber
    let query = supabase
      .from("newsletter_subscribers")
      .update({ 
        is_subscribed: false, 
        email_opt_in: false,
        updated_at: new Date().toISOString() 
      })
      .eq("email", email.toLowerCase());
    
    // If organization ID is provided, scope to that org
    if (orgId) {
      query = query.eq("organization_id", orgId);
    }

    const { error, count } = await query;

    if (error) {
      console.error("Error unsubscribing:", error);
      return new Response(
        generateHtmlPage("Error", "Failed to process unsubscribe request. Please try again.", false),
        { headers: { ...corsHeaders, "Content-Type": "text/html" }, status: 500 }
      );
    }

    return new Response(
      generateHtmlPage(
        "Unsubscribed Successfully", 
        "You have been successfully unsubscribed from our newsletter. You will no longer receive emails from us.",
        true
      ),
      { headers: { ...corsHeaders, "Content-Type": "text/html" }, status: 200 }
    );

  } catch (error) {
    console.error("Error in unsubscribe-newsletter function:", error);
    return new Response(
      generateHtmlPage("Error", "An unexpected error occurred. Please try again later.", false),
      { headers: { ...corsHeaders, "Content-Type": "text/html" }, status: 500 }
    );
  }
};

function generateHtmlPage(title: string, message: string, success: boolean): string {
  const iconColor = success ? "#22c55e" : "#ef4444";
  const icon = success 
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ed 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
      padding: 48px;
      text-align: center;
      max-width: 480px;
      width: 100%;
    }
    .icon {
      margin-bottom: 24px;
    }
    h1 {
      color: #1a1a1a;
      font-size: 24px;
      margin-bottom: 16px;
    }
    p {
      color: #666;
      font-size: 16px;
      line-height: 1.6;
    }
    .close-note {
      margin-top: 24px;
      font-size: 14px;
      color: #999;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">${icon}</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <p class="close-note">You can close this page.</p>
  </div>
</body>
</html>
  `;
}

serve(handler);
