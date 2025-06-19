
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

    const { 
      email, 
      name, 
      phone, 
      emailOptIn = true, 
      smsOptIn = false,
      communicationPreferences = { frequency: 'weekly', preferred_time: 'morning' },
      contactSource = 'newsletter'
    }: SubscribeRequest = await req.json();

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
      contactSource
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
