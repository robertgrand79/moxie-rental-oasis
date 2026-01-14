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

  const url = new URL(req.url);
  const email = url.searchParams.get("email");
  const orgId = url.searchParams.get("org");

  // Initialize Supabase client
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Handle form submission (POST)
  if (req.method === "POST") {
    try {
      const formData = await req.formData();
      const submittedEmail = formData.get("email") as string;
      const emailOptIn = formData.get("email_opt_in") === "on";
      const smsOptIn = formData.get("sms_opt_in") === "on";
      const submittedOrgId = formData.get("org_id") as string;

      if (!submittedEmail) {
        return new Response(
          generateHtmlPage("Error", "Email address is required.", null, null, false),
          { headers: { ...corsHeaders, "Content-Type": "text/html" }, status: 400 }
        );
      }

      let query = supabase
        .from("newsletter_subscribers")
        .update({ 
          email_opt_in: emailOptIn,
          sms_opt_in: smsOptIn,
          is_subscribed: emailOptIn || smsOptIn, // Keep subscribed if any channel is active
          updated_at: new Date().toISOString() 
        })
        .eq("email", submittedEmail.toLowerCase());
      
      if (submittedOrgId) {
        query = query.eq("organization_id", submittedOrgId);
      }

      const { error } = await query;

      if (error) {
        console.error("Error updating preferences:", error);
        return new Response(
          generateHtmlPage("Error", "Failed to update preferences. Please try again.", null, null, false),
          { headers: { ...corsHeaders, "Content-Type": "text/html" }, status: 500 }
        );
      }

      return new Response(
        generateSuccessPage(),
        { headers: { ...corsHeaders, "Content-Type": "text/html" }, status: 200 }
      );

    } catch (error) {
      console.error("Error processing form:", error);
      return new Response(
        generateHtmlPage("Error", "An unexpected error occurred.", null, null, false),
        { headers: { ...corsHeaders, "Content-Type": "text/html" }, status: 500 }
      );
    }
  }

  // Handle GET request - show preferences form
  if (!email) {
    return new Response(
      generateHtmlPage("Error", "Email address is required.", null, null, false),
      { headers: { ...corsHeaders, "Content-Type": "text/html" }, status: 400 }
    );
  }

  try {
    // Fetch current preferences
    let query = supabase
      .from("newsletter_subscribers")
      .select("email, email_opt_in, sms_opt_in, first_name, phone")
      .eq("email", email.toLowerCase());
    
    if (orgId) {
      query = query.eq("organization_id", orgId);
    }

    const { data: subscriber, error } = await query.single();

    if (error || !subscriber) {
      return new Response(
        generateHtmlPage("Not Found", "Subscriber not found. Please check your email address.", null, null, false),
        { headers: { ...corsHeaders, "Content-Type": "text/html" }, status: 404 }
      );
    }

    return new Response(
      generateHtmlPage("Update Preferences", "", subscriber, orgId, true),
      { headers: { ...corsHeaders, "Content-Type": "text/html" }, status: 200 }
    );

  } catch (error) {
    console.error("Error in update-newsletter-preferences function:", error);
    return new Response(
      generateHtmlPage("Error", "An unexpected error occurred. Please try again later.", null, null, false),
      { headers: { ...corsHeaders, "Content-Type": "text/html" }, status: 500 }
    );
  }
};

interface Subscriber {
  email: string;
  email_opt_in: boolean;
  sms_opt_in: boolean;
  first_name?: string;
  phone?: string;
}

function generateHtmlPage(title: string, message: string, subscriber: Subscriber | null, orgId: string | null, showForm: boolean): string {
  const formHtml = subscriber && showForm ? `
    <form method="POST" action="">
      <input type="hidden" name="email" value="${subscriber.email}">
      <input type="hidden" name="org_id" value="${orgId || ''}">
      
      <div class="greeting">
        ${subscriber.first_name ? `Hi ${subscriber.first_name}!` : 'Hello!'}
      </div>
      
      <div class="form-group">
        <label class="checkbox-label">
          <input type="checkbox" name="email_opt_in" ${subscriber.email_opt_in ? 'checked' : ''}>
          <span class="checkmark"></span>
          <span class="label-text">
            <strong>Email Newsletter</strong>
            <small>Receive updates and news via email</small>
          </span>
        </label>
      </div>
      
      <div class="form-group">
        <label class="checkbox-label">
          <input type="checkbox" name="sms_opt_in" ${subscriber.sms_opt_in ? 'checked' : ''}>
          <span class="checkmark"></span>
          <span class="label-text">
            <strong>SMS Updates</strong>
            <small>Receive important updates via text message</small>
          </span>
        </label>
      </div>
      
      <button type="submit" class="submit-btn">Save Preferences</button>
    </form>
  ` : `<p class="error-message">${message}</p>`;

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
      max-width: 480px;
      width: 100%;
    }
    h1 {
      color: #1a1a1a;
      font-size: 24px;
      margin-bottom: 8px;
      text-align: center;
    }
    .greeting {
      color: #666;
      font-size: 16px;
      margin-bottom: 24px;
      text-align: center;
    }
    .form-group {
      margin-bottom: 16px;
    }
    .checkbox-label {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .checkbox-label:hover {
      border-color: #3b82f6;
      background: #f8fafc;
    }
    .checkbox-label input {
      width: 20px;
      height: 20px;
      margin-top: 2px;
      accent-color: #3b82f6;
    }
    .label-text {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .label-text strong {
      color: #1a1a1a;
    }
    .label-text small {
      color: #666;
      font-size: 13px;
    }
    .submit-btn {
      width: 100%;
      padding: 14px 24px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.2s;
      margin-top: 24px;
    }
    .submit-btn:hover {
      background: #2563eb;
    }
    .error-message {
      color: #ef4444;
      text-align: center;
      padding: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${title}</h1>
    ${formHtml}
  </div>
</body>
</html>
  `;
}

function generateSuccessPage(): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preferences Updated</title>
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
    <div class="icon">
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
    </div>
    <h1>Preferences Updated!</h1>
    <p>Your communication preferences have been saved successfully.</p>
    <p class="close-note">You can close this page.</p>
  </div>
</body>
</html>
  `;
}

serve(handler);
