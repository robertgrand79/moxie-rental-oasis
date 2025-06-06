
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubscribeRequest {
  email: string;
  name?: string;
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

    const { email, name }: SubscribeRequest = await req.json();

    if (!email || !email.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Valid email address is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if already subscribed
    const { data: existing } = await supabaseClient
      .from("newsletter_subscribers")
      .select("id, is_active")
      .eq("email", email.toLowerCase())
      .single();

    if (existing) {
      if (existing.is_active) {
        return new Response(
          JSON.stringify({ message: "Email is already subscribed" }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      } else {
        // Reactivate subscription
        const { error: updateError } = await supabaseClient
          .from("newsletter_subscribers")
          .update({ 
            is_active: true, 
            updated_at: new Date().toISOString(),
            name: name || null
          })
          .eq("id", existing.id);

        if (updateError) {
          throw updateError;
        }
      }
    } else {
      // Create new subscription
      const { error: insertError } = await supabaseClient
        .from("newsletter_subscribers")
        .insert({
          email: email.toLowerCase(),
          name: name || null,
          is_active: true,
        });

      if (insertError) {
        throw insertError;
      }
    }

    console.log(`Newsletter subscription successful for: ${email}`);

    return new Response(
      JSON.stringify({ message: "Successfully subscribed to newsletter" }),
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
