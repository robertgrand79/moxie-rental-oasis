import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  console.log(`[PLATFORM-WEBHOOK] ${step}`, details ? JSON.stringify(details) : '');
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const signature = req.headers.get("stripe-signature");
    const body = await req.text();

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get platform Stripe keys from platform_settings
    const { data: settingsData } = await supabaseClient
      .from("platform_settings")
      .select("key, value")
      .in("key", ["platform_stripe_secret_key", "platform_stripe_webhook_secret"]);

    const platformStripeKey = settingsData?.find(s => s.key === "platform_stripe_secret_key")?.value;
    const webhookSecret = settingsData?.find(s => s.key === "platform_stripe_webhook_secret")?.value;

    if (!platformStripeKey) {
      throw new Error("Platform Stripe key not configured");
    }

    const stripe = new Stripe(platformStripeKey, {
      apiVersion: "2023-10-16",
    });

    let event: Stripe.Event;

    if (webhookSecret && signature) {
      try {
        event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
      } catch (err) {
        logStep("Webhook signature verification failed", { error: err.message });
        return new Response(JSON.stringify({ error: "Webhook signature verification failed" }), {
          status: 400,
        });
      }
    } else {
      event = JSON.parse(body);
      logStep("WARNING: No webhook secret configured, skipping signature verification");
    }

    logStep("Processing event", { type: event.type });

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const organizationId = subscription.metadata?.organization_id;
        const templateSlug = subscription.metadata?.template_slug;

        if (!organizationId) {
          logStep("No organization_id in subscription metadata");
          break;
        }

        const status = subscription.status;
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
        const trialEnd = subscription.trial_end 
          ? new Date(subscription.trial_end * 1000) 
          : null;

        logStep("Updating organization subscription", { 
          organizationId, 
          status, 
          templateSlug 
        });

        await supabaseClient
          .from("organizations")
          .update({
            subscription_status: status,
            subscription_tier: templateSlug || "free",
            trial_ends_at: trialEnd?.toISOString() || null,
            template_type: templateSlug || "multi_property"
          })
          .eq("id", organizationId);

        logStep("Organization updated");
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const organizationId = subscription.metadata?.organization_id;

        if (organizationId) {
          logStep("Subscription cancelled", { organizationId });
          
          await supabaseClient
            .from("organizations")
            .update({
              subscription_status: "canceled",
              subscription_tier: "free"
            })
            .eq("id", organizationId);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const { data: org } = await supabaseClient
          .from("organizations")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (org) {
          logStep("Payment succeeded", { organizationId: org.id });
          
          await supabaseClient
            .from("organizations")
            .update({ subscription_status: "active" })
            .eq("id", org.id);
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const { data: org } = await supabaseClient
          .from("organizations")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (org) {
          logStep("Payment failed", { organizationId: org.id });
          
          await supabaseClient
            .from("organizations")
            .update({ subscription_status: "past_due" })
            .eq("id", org.id);
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    logStep("Error processing webhook", { message: error.message });
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
