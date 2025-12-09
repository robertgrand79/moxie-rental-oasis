import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  console.log(`[CUSTOMER-PORTAL] ${step}`, details ? JSON.stringify(details) : '');
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting customer portal session creation");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get platform Stripe key from platform_settings
    const { data: settingsData, error: settingsError } = await supabaseClient
      .from("platform_settings")
      .select("key, value")
      .eq("key", "platform_stripe_secret_key")
      .single();

    if (settingsError || !settingsData?.value) {
      logStep("Error fetching platform settings", settingsError);
      throw new Error("Platform Stripe key not configured");
    }

    const stripe = new Stripe(settingsData.value, {
      apiVersion: "2023-10-16",
    });

    const { organizationId, returnUrl } = await req.json();
    logStep("Portal request", { organizationId });

    // Get organization details
    const { data: org, error: orgError } = await supabaseClient
      .from("organizations")
      .select("stripe_customer_id, name")
      .eq("id", organizationId)
      .single();

    if (orgError || !org) {
      throw new Error("Organization not found");
    }

    if (!org.stripe_customer_id) {
      throw new Error("No Stripe customer found for this organization. Please subscribe first.");
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: org.stripe_customer_id,
      return_url: returnUrl || `${req.headers.get("origin")}/admin/organization`,
    });

    logStep("Created portal session", { sessionId: session.id });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    logStep("Error", { message: error.message });
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
