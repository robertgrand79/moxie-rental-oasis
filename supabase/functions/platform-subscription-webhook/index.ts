import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
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

    logStep("Processing event", { type: event.type, id: event.id });

    // Helper to get org owner email for notifications
    const getOrgOwnerEmail = async (orgId: string): Promise<string | null> => {
      const { data: owner } = await supabaseClient
        .from("organization_members")
        .select("user_id")
        .eq("organization_id", orgId)
        .eq("role", "owner")
        .single();

      if (owner) {
        const { data: profile } = await supabaseClient
          .from("profiles")
          .select("email")
          .eq("id", owner.user_id)
          .single();
        return profile?.email || null;
      }
      return null;
    };

    switch (event.type) {
      case "checkout.session.completed": {
        // Handle subscription checkout completion
        const session = event.data.object as Stripe.Checkout.Session;
        const organizationId = session.metadata?.organization_id;
        const templateSlug = session.metadata?.template_slug;

        if (organizationId && session.subscription) {
          logStep("Subscription checkout completed", { organizationId, templateSlug });
          
          // Fetch the subscription to get accurate status
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          
          await supabaseClient
            .from("organizations")
            .update({
              subscription_status: subscription.status,
              subscription_tier: templateSlug || "free",
              trial_ends_at: subscription.trial_end 
                ? new Date(subscription.trial_end * 1000).toISOString() 
                : null,
              template_type: templateSlug || "multi_property"
            })
            .eq("id", organizationId);

          // Create welcome notification
          await supabaseClient.from('admin_notifications').insert({
            organization_id: organizationId,
            user_id: null,
            notification_type: 'subscription_started',
            category: 'billing',
            title: 'Welcome to StayMoxie! 🎉',
            message: subscription.trial_end 
              ? `Your 14-day free trial has started. Your subscription will begin after the trial.`
              : `Your subscription is now active. Enjoy all the features!`,
            action_url: `/admin/settings/billing`,
            priority: 'normal',
          });
        }
        break;
      }

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

          // Create cancellation notification
          await supabaseClient.from('admin_notifications').insert({
            organization_id: organizationId,
            user_id: null,
            notification_type: 'subscription_cancelled',
            category: 'billing',
            title: 'Subscription Cancelled',
            message: 'Your subscription has been cancelled. You can reactivate anytime to restore access to all features.',
            action_url: `/admin/settings/billing`,
            priority: 'high',
          });
        }
        break;
      }

      case "customer.subscription.trial_will_end": {
        // Trial ending in 3 days notification
        const subscription = event.data.object as Stripe.Subscription;
        const organizationId = subscription.metadata?.organization_id;

        if (organizationId) {
          const trialEnd = subscription.trial_end 
            ? new Date(subscription.trial_end * 1000)
            : null;

          logStep("Trial ending soon", { organizationId, trialEnd });

          await supabaseClient.from('admin_notifications').insert({
            organization_id: organizationId,
            user_id: null,
            notification_type: 'trial_ending',
            category: 'billing',
            title: 'Your Trial Ends Soon',
            message: `Your free trial ends on ${trialEnd?.toLocaleDateString()}. Add a payment method to continue using all features.`,
            action_url: `/admin/settings/billing`,
            priority: 'high',
          });
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const { data: org } = await supabaseClient
          .from("organizations")
          .select("id, name")
          .eq("stripe_customer_id", customerId)
          .single();

        if (org) {
          logStep("Payment succeeded", { organizationId: org.id });
          
          await supabaseClient
            .from("organizations")
            .update({ subscription_status: "active" })
            .eq("id", org.id);

          // Don't notify for first invoice (handled by subscription created)
          if (invoice.billing_reason !== 'subscription_create') {
            await supabaseClient.from('admin_notifications').insert({
              organization_id: org.id,
              user_id: null,
              notification_type: 'payment_succeeded',
              category: 'billing',
              title: 'Payment Successful',
              message: `Your payment of $${(invoice.amount_paid / 100).toFixed(2)} was successful.`,
              action_url: `/admin/settings/billing`,
              priority: 'normal',
            });
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const { data: org } = await supabaseClient
          .from("organizations")
          .select("id, name")
          .eq("stripe_customer_id", customerId)
          .single();

        if (org) {
          logStep("Payment failed", { organizationId: org.id });
          
          await supabaseClient
            .from("organizations")
            .update({ subscription_status: "past_due" })
            .eq("id", org.id);

          // Create urgent notification for payment failure
          await supabaseClient.from('admin_notifications').insert({
            organization_id: org.id,
            user_id: null,
            notification_type: 'payment_failed',
            category: 'billing',
            title: '⚠️ Payment Failed',
            message: `Your payment of $${(invoice.amount_due / 100).toFixed(2)} failed. Please update your payment method to avoid service interruption.`,
            action_url: `/admin/settings/billing`,
            priority: 'urgent',
          });
        }
        break;
      }

      case "invoice.upcoming": {
        // Notify about upcoming invoice (sent ~3 days before billing)
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const { data: org } = await supabaseClient
          .from("organizations")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (org && invoice.amount_due > 0) {
          logStep("Upcoming invoice", { organizationId: org.id, amount: invoice.amount_due });
          
          // Optional: notify about upcoming charge
          // await supabaseClient.from('admin_notifications').insert({...});
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
