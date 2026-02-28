import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { reservationId, propertyId, guestEmail, totalAmount, propertyTitle, checkInDate, checkOutDate } = await req.json();
    logStep("Request data received", { reservationId, propertyId, guestEmail, totalAmount, propertyTitle });

    if (!reservationId || !guestEmail || !totalAmount || !propertyTitle) {
      throw new Error("Missing required fields");
    }

    // Determine which Stripe key to use
    let activeStripeKey = stripeKey;
    let stripeAccountId = null;
    let useConnectSplit = false;
    let connectAccountId = null;
    let platformFeePercent = 10;
    
    if (propertyId) {
      // Get property's organization
      const { data: property } = await supabaseClient
        .from('properties')
        .select('organization_id')
        .eq('id', propertyId)
        .single();

      if (property?.organization_id) {
        // Check if org has Stripe Connect configured and active
        const { data: org } = await supabaseClient
          .from('organizations')
          .select('stripe_secret_key, stripe_account_id, stripe_connect_id, stripe_connect_status, payments_enabled, platform_fee_percent')
          .eq('id', property.organization_id)
          .single();

        if (org?.stripe_connect_id && org?.payments_enabled && org?.stripe_connect_status === 'active') {
          // Use Stripe Connect with destination charges
          useConnectSplit = true;
          connectAccountId = org.stripe_connect_id;
          platformFeePercent = org.platform_fee_percent || 10;
          // Platform key handles the charge; destination goes to connected account
          activeStripeKey = Deno.env.get("PLATFORM_STRIPE_SECRET_KEY") || stripeKey;
          logStep("Using Stripe Connect split payment", { connectAccountId, platformFeePercent });
        } else if (org?.stripe_secret_key) {
          // Fallback: org's own Stripe key (legacy)
          activeStripeKey = org.stripe_secret_key;
          stripeAccountId = org.stripe_account_id;
          logStep("Using organization-wide Stripe account (legacy)", { stripeAccountId });
        } else {
          // Check property-specific credentials
          const { data: propertyCredentials } = await supabaseClient
            .rpc('get_property_stripe_credentials', { p_property_id: propertyId });
          if (propertyCredentials?.length > 0 && propertyCredentials[0].stripe_secret_key) {
            activeStripeKey = propertyCredentials[0].stripe_secret_key;
            stripeAccountId = propertyCredentials[0].stripe_account_id;
            logStep("Using property-specific Stripe account", { stripeAccountId });
          }
        }
      }
    }

    if (!activeStripeKey) {
      throw new Error("Stripe not configured for this property or organization");
    }

    const stripe = new Stripe(activeStripeKey, { apiVersion: "2023-10-16" });
    
    // Check if customer exists
    const customers = await stripe.customers.list({ email: guestEmail, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Existing customer found", { customerId });
    }

    // Build checkout session params
    const sessionParams: any = {
      customer: customerId,
      customer_email: customerId ? undefined : guestEmail,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { 
              name: `Booking: ${propertyTitle}`,
              description: `Stay from ${checkInDate} to ${checkOutDate}`
            },
            unit_amount: Math.round(totalAmount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/booking-success?session_id={CHECKOUT_SESSION_ID}&reservation_id=${reservationId}`,
      cancel_url: `${req.headers.get("origin")}/booking-cancelled?reservation_id=${reservationId}`,
      metadata: {
        reservationId: reservationId,
        propertyId: propertyId || '',
        stripeAccountId: stripeAccountId || '',
      },
    };

    // Add Stripe Connect destination charge with platform fee
    if (useConnectSplit && connectAccountId) {
      const applicationFeeAmount = Math.round(totalAmount * 100 * (platformFeePercent / 100));
      sessionParams.payment_intent_data = {
        application_fee_amount: applicationFeeAmount,
        transfer_data: {
          destination: connectAccountId,
        },
      };
      logStep("Destination charge configured", { applicationFeeAmount, destination: connectAccountId });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create(sessionParams);

    logStep("Checkout session created", { sessionId: session.id });

    // Update reservation with payment session
    const { error: updateError } = await supabaseClient
      .from("property_reservations")
      .update({ 
        payment_status: "pending",
        stripe_session_id: session.id
      })
      .eq("id", reservationId);

    if (updateError) {
      logStep("Error updating reservation", updateError);
      throw updateError;
    }

    logStep("Reservation updated with payment session");

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});