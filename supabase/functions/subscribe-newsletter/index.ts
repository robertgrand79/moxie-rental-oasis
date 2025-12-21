import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubscribeRequest {
  email: string;
  name?: string;
  phone?: string;
  emailOptIn?: boolean;
  smsOptIn?: boolean;
  communicationPreferences?: {
    frequency: string;
    preferred_time: string;
  };
  contactSource?: string;
  turnstileToken?: string;
}

// Simple in-memory rate limiting (resets on function cold start)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_REQUESTS_PER_WINDOW = 10;

function checkRateLimit(identifier: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1 };
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - record.count };
}

async function verifyTurnstile(token: string, clientIp: string): Promise<boolean> {
  const secretKey = Deno.env.get("TURNSTILE_SECRET_KEY");
  if (!secretKey) {
    console.warn("TURNSTILE_SECRET_KEY not configured, skipping verification");
    return true; // Allow if not configured
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token);
    if (clientIp) {
      formData.append("remoteip", clientIp);
    }

    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      }
    );

    const result = await response.json();
    console.log("Turnstile verification:", { success: result.success, hostname: result.hostname });
    return result.success === true;
  } catch (error) {
    console.error("Turnstile verification error:", error);
    return false;
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP for rate limiting
    const clientIp = req.headers.get("cf-connecting-ip") || 
                     req.headers.get("x-forwarded-for")?.split(",")[0] || 
                     req.headers.get("x-real-ip") || 
                     "unknown";

    // Check rate limit
    const rateLimit = checkRateLimit(clientIp);
    if (!rateLimit.allowed) {
      console.warn(`Rate limit exceeded for IP: ${clientIp}`);
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        { 
          status: 429, 
          headers: { 
            "Content-Type": "application/json", 
            "Retry-After": "3600",
            ...corsHeaders 
          } 
        }
      );
    }

    const { 
      email, 
      name, 
      phone, 
      emailOptIn = true, 
      smsOptIn = false,
      communicationPreferences = { frequency: 'weekly', preferred_time: 'morning' },
      contactSource = 'newsletter',
      turnstileToken
    }: SubscribeRequest = await req.json();

    // Verify Turnstile token if provided
    if (turnstileToken) {
      const isValid = await verifyTurnstile(turnstileToken, clientIp);
      if (!isValid) {
        return new Response(
          JSON.stringify({ error: "Security verification failed. Please try again." }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    if (!email || !email.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Valid email address is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Ensure at least one communication method is selected
    if (!emailOptIn && !smsOptIn) {
      return new Response(
        JSON.stringify({ error: "At least one communication method (email or SMS) must be selected" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // If SMS is selected, phone number is required
    if (smsOptIn && (!phone || phone.trim() === '')) {
      return new Response(
        JSON.stringify({ error: "Phone number is required for SMS updates" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Check if already subscribed
    const { data: existing } = await supabaseClient
      .from("newsletter_subscribers")
      .select("id, is_active, email_opt_in, sms_opt_in")
      .eq("email", email.toLowerCase())
      .single();

    if (existing) {
      // Update existing subscription with new preferences
      const { error: updateError } = await supabaseClient
        .from("newsletter_subscribers")
        .update({ 
          is_active: true,
          email_opt_in: emailOptIn,
          sms_opt_in: smsOptIn,
          phone: phone || null,
          name: name || null,
          communication_preferences: communicationPreferences,
          contact_source: contactSource,
          last_engagement_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (updateError) {
        throw updateError;
      }

      const message = existing.is_active 
        ? "Subscription preferences updated successfully"
        : "Welcome back! Your subscription has been reactivated with your new preferences.";

      return new Response(
        JSON.stringify({ message }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    } else {
      // Create new subscription
      const { error: insertError } = await supabaseClient
        .from("newsletter_subscribers")
        .insert({
          email: email.toLowerCase(),
          name: name || null,
          phone: phone || null,
          is_active: true,
          email_opt_in: emailOptIn,
          sms_opt_in: smsOptIn,
          communication_preferences: communicationPreferences,
          contact_source: contactSource,
          last_engagement_date: new Date().toISOString(),
        });

      if (insertError) {
        throw insertError;
      }
    }

    console.log(`Newsletter subscription successful for: ${email} with preferences:`, {
      emailOptIn,
      smsOptIn,
      phone: phone ? 'provided' : 'not provided',
      contactSource,
      clientIp: clientIp.substring(0, 8) + '***', // Log partial IP for debugging
      rateLimit: rateLimit.remaining
    });

    const channels = [];
    if (emailOptIn) channels.push('email');
    if (smsOptIn) channels.push('SMS');

    return new Response(
      JSON.stringify({ 
        message: `Successfully subscribed via ${channels.join(' and ')}`,
        channels: channels
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in subscribe-newsletter function:", error);
    return new Response(
      JSON.stringify({ error: "Failed to subscribe to newsletter" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
