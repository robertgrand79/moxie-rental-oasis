import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      throw new Error("No stripe-signature header");
    }

    const body = await req.text();
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Parse event without verification first to get metadata
    let event: Stripe.Event;
    try {
      event = JSON.parse(body) as Stripe.Event;
    } catch (err) {
      throw new Error("Invalid JSON");
    }

    logStep("Event parsed", { type: event.type });

    // Get metadata to determine which Stripe account to verify against
    const metadata = (event.data.object as any).metadata || {};
    const reservationId = metadata.reservationId;
    const propertyId = metadata.propertyId;
    const stripeAccountId = metadata.stripeAccountId;

    logStep("Metadata extracted", { reservationId, propertyId, stripeAccountId });

    // Determine which webhook secret to use for verification
    let webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (propertyId) {
      // Check property-specific webhook secret
      const { data: property } = await supabaseClient
        .from('properties')
        .select('stripe_webhook_secret, organization_id')
        .eq('id', propertyId)
        .single();

      if (property?.stripe_webhook_secret) {
        webhookSecret = property.stripe_webhook_secret;
        logStep("Using property-specific webhook secret");
      } else if (property?.organization_id) {
        // Check organization webhook secret
        const { data: org } = await supabaseClient
          .from('organizations')
          .select('stripe_webhook_secret')
          .eq('id', property.organization_id)
          .single();

        if (org?.stripe_webhook_secret) {
          webhookSecret = org.stripe_webhook_secret;
          logStep("Using organization webhook secret");
        }
      }
    }

    if (!webhookSecret) {
      throw new Error("No webhook secret configured");
    }

    // Get appropriate Stripe key for verification
    let stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    
    if (propertyId) {
      const { data: property } = await supabaseClient
        .from('properties')
        .select('stripe_secret_key, organization_id')
        .eq('id', propertyId)
        .single();

      if (property?.stripe_secret_key) {
        stripeKey = property.stripe_secret_key;
      } else if (property?.organization_id) {
        const { data: org } = await supabaseClient
          .from('organizations')
          .select('stripe_secret_key')
          .eq('id', property.organization_id)
          .single();

        if (org?.stripe_secret_key) {
          stripeKey = org.stripe_secret_key;
        }
      }
    }

    if (!stripeKey) {
      throw new Error("No Stripe key configured");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Verify webhook signature (use async version for Deno compatibility)
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
      logStep("Signature verified");
    } catch (err) {
      logStep("Signature verification failed", { error: err.message });
      throw new Error(`Webhook signature verification failed: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Processing checkout.session.completed", { sessionId: session.id });

        if (!reservationId) {
          throw new Error("No reservationId in metadata");
        }

        // Update reservation as paid
        const { error: updateError } = await supabaseClient
          .from("property_reservations")
          .update({
            payment_status: "paid",
            booking_status: "confirmed",
          })
          .eq("id", reservationId);

        if (updateError) {
          logStep("Error updating reservation", updateError);
          throw updateError;
        }

        logStep("Reservation marked as paid", { reservationId });

        // Get reservation details to create availability block
        const { data: reservation, error: fetchError } = await supabaseClient
          .from("property_reservations")
          .select("check_in_date, check_out_date, guest_name")
          .eq("id", reservationId)
          .single();

        if (fetchError) {
          logStep("Error fetching reservation for availability block", fetchError);
        } else if (reservation && propertyId) {
          // Create availability block for direct booking
          const { error: blockError } = await supabaseClient
            .from("availability_blocks")
            .insert({
              property_id: propertyId,
              start_date: reservation.check_in_date,
              end_date: reservation.check_out_date,
              block_type: 'booked',
              source_platform: 'direct',
              external_booking_id: reservationId,
              notes: `Direct Booking - ${reservation.guest_name}`,
              sync_status: 'synced'
            });

          if (blockError) {
            logStep("Error creating availability block", blockError);
          } else {
            logStep("Availability block created", { reservationId, propertyId });
          }
        }

        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Processing checkout.session.expired", { sessionId: session.id });

        if (reservationId) {
          const { error: updateError } = await supabaseClient
            .from("property_reservations")
            .update({ payment_status: "failed" })
            .eq("id", reservationId);

          if (updateError) {
            logStep("Error updating reservation", updateError);
          }
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        logStep("Processing payment_intent.payment_failed", { paymentIntentId: paymentIntent.id });

        if (reservationId) {
          const { error: updateError } = await supabaseClient
            .from("property_reservations")
            .update({ payment_status: "failed" })
            .eq("id", reservationId);

          if (updateError) {
            logStep("Error updating reservation", updateError);
          }
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in webhook handler", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
