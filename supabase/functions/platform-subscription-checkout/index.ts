import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  console.log(`[PLATFORM-CHECKOUT] ${step}`, details ? JSON.stringify(details) : '');
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Starting platform subscription checkout");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get platform Stripe key from platform_settings
    const { data: settingsData, error: settingsError } = await supabaseClient
      .from("platform_settings")
      .select("key, value")
      .in("key", ["platform_stripe_secret_key", "platform_stripe_publishable_key"]);

    if (settingsError) {
      logStep("Error fetching platform settings", settingsError);
      throw new Error("Failed to fetch platform Stripe configuration");
    }

    const platformStripeKey = settingsData?.find(s => s.key === "platform_stripe_secret_key")?.value;
    
    if (!platformStripeKey) {
      throw new Error("Platform Stripe key not configured");
    }

    const stripe = new Stripe(platformStripeKey, {
      apiVersion: "2023-10-16",
    });

    const { organizationId, templateSlug, billingCycle, successUrl, cancelUrl } = await req.json();
    logStep("Checkout request", { organizationId, templateSlug, billingCycle });

    // Get organization details
    const { data: org, error: orgError } = await supabaseClient
      .from("organizations")
      .select("*")
      .eq("id", organizationId)
      .single();

    if (orgError || !org) {
      throw new Error("Organization not found");
    }

    // Get template pricing
    const { data: template, error: templateError } = await supabaseClient
      .from("site_templates")
      .select("*")
      .eq("slug", templateSlug)
      .single();

    if (templateError || !template) {
      throw new Error("Template not found");
    }

    // Determine which price ID to use based on billing cycle
    let stripePriceId: string | null = null;
    
    if (billingCycle === 'yearly') {
      stripePriceId = template.stripe_annual_price_id;
      if (!stripePriceId) {
        logStep("No annual price ID configured, falling back to monthly");
        stripePriceId = template.stripe_price_id;
      }
    } else {
      stripePriceId = template.stripe_price_id;
    }

    if (!stripePriceId) {
      throw new Error("Template Stripe price not configured");
    }

    logStep("Using price ID", { stripePriceId, billingCycle });

    // Get or create Stripe customer
    let customerId = org.stripe_customer_id;

    if (!customerId) {
      // Find org owner's email
      const { data: owner } = await supabaseClient
        .from("organization_members")
        .select("user_id")
        .eq("organization_id", organizationId)
        .eq("role", "owner")
        .single();

      let email = "customer@example.com";
      if (owner) {
        const { data: profile } = await supabaseClient
          .from("profiles")
          .select("email")
          .eq("id", owner.user_id)
          .single();
        if (profile?.email) email = profile.email;
      }

      const customer = await stripe.customers.create({
        email,
        metadata: {
          organization_id: organizationId,
          organization_name: org.name
        }
      });
      customerId = customer.id;

      // Save customer ID
      await supabaseClient
        .from("organizations")
        .update({ stripe_customer_id: customerId })
        .eq("id", organizationId);

      logStep("Created Stripe customer", { customerId });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      success_url: successUrl || `${req.headers.get("origin")}/admin?subscription=success`,
      cancel_url: cancelUrl || `${req.headers.get("origin")}/admin?subscription=cancelled`,
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          organization_id: organizationId,
          template_slug: templateSlug,
          billing_cycle: billingCycle || 'monthly'
        }
      },
      metadata: {
        organization_id: organizationId,
        template_slug: templateSlug,
        billing_cycle: billingCycle || 'monthly'
      }
    });

    logStep("Created checkout session", { sessionId: session.id });

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
