
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

const validatePhoneNumber = (phone: string): string | null => {
  if (!phone) return null;
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it's a valid US number (10 digits) or international (7-15 digits)
  if (cleaned.length === 10) {
    // US number, add country code
    return `+1${cleaned}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    // US number with country code
    return `+${cleaned}`;
  } else if (cleaned.length >= 7 && cleaned.length <= 15) {
    // International number
    return `+${cleaned}`;
  }
  
  return null;
};

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

    // If SMS is selected, phone number is required and must be valid
    let validatedPhone = null;
    if (smsOptIn) {
      if (!phone || phone.trim() === '') {
        return new Response(
          JSON.stringify({ error: "Phone number is required for SMS updates" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      
      validatedPhone = validatePhoneNumber(phone);
      if (!validatedPhone) {
        return new Response(
          JSON.stringify({ error: "Please enter a valid phone number" }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    console.log('📝 Newsletter subscription request:', {
      email,
      name: name || 'Not provided',
      phone: validatedPhone ? 'Provided' : 'Not provided',
      emailOptIn,
      smsOptIn,
      contactSource
    });

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
          phone: validatedPhone,
          name: name || null,
          communication_preferences: communicationPreferences,
          contact_source: contactSource,
          last_engagement_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (updateError) {
        console.error('❌ Error updating subscription:', updateError);
        throw updateError;
      }

      const message = existing.is_active 
        ? "Subscription preferences updated successfully"
        : "Welcome back! Your subscription has been reactivated with your new preferences.";

      console.log('✅ Updated existing subscription for:', email);

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
          phone: validatedPhone,
          is_active: true,
          email_opt_in: emailOptIn,
          sms_opt_in: smsOptIn,
          communication_preferences: communicationPreferences,
          contact_source: contactSource,
          last_engagement_date: new Date().toISOString(),
        });

      if (insertError) {
        console.error('❌ Error creating subscription:', insertError);
        throw insertError;
      }

      console.log('✅ Created new subscription for:', email);
    }

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
    console.error("❌ Error in subscribe-newsletter function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to subscribe to newsletter" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
