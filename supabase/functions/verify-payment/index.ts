import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[VERIFY-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { sessionId, reservationId } = await req.json();
    logStep("Request data received", { sessionId, reservationId });

    // Fetch reservation to get property_id
    const { data: reservation, error: reservationError } = await supabaseClient
      .from("property_reservations")
      .select("property_id")
      .eq("id", reservationId)
      .single();

    if (reservationError || !reservation) {
      logStep("Error fetching reservation", reservationError);
      throw new Error("Reservation not found");
    }

    logStep("Reservation found", { propertyId: reservation.property_id });

    // Get property-specific Stripe key
    let stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    
    const { data: property } = await supabaseClient
      .from("properties")
      .select("stripe_secret_key, organization_id")
      .eq("id", reservation.property_id)
      .single();

    if (property?.stripe_secret_key) {
      stripeKey = property.stripe_secret_key;
      logStep("Using property-specific Stripe key");
    } else if (property?.organization_id) {
      // Try organization-level Stripe key
      const { data: org } = await supabaseClient
        .from("organizations")
        .select("stripe_secret_key")
        .eq("id", property.organization_id)
        .single();
      
      if (org?.stripe_secret_key) {
        stripeKey = org.stripe_secret_key;
        logStep("Using organization-level Stripe key");
      }
    }

    if (!stripeKey) {
      throw new Error("No Stripe key configured for this property");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    logStep("Checkout session retrieved", { 
      paymentStatus: session.payment_status,
      status: session.status
    });

    let paymentStatus = "pending";
    let bookingStatus = "pending";

    if (session.payment_status === "paid") {
      paymentStatus = "paid";
      bookingStatus = "confirmed";
    } else if (session.payment_status === "unpaid") {
      paymentStatus = "failed";
      bookingStatus = "cancelled";
    }

    // Update reservation
    const { error: updateError } = await supabaseClient
      .from("property_reservations")
      .update({ 
        payment_status: paymentStatus,
        booking_status: bookingStatus,
        updated_at: new Date().toISOString()
      })
      .eq("id", reservationId);

    if (updateError) {
      logStep("Error updating reservation", updateError);
      throw updateError;
    }

    logStep("Reservation updated", { paymentStatus, bookingStatus });

    // Schedule confirmation email if booking was confirmed
    if (bookingStatus === "confirmed") {
      try {
        logStep("Scheduling confirmation messages for reservation", { reservationId });
        
        const scheduleResponse = await fetch(
          `${Deno.env.get("SUPABASE_URL")}/functions/v1/schedule-reservation-messages`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            },
            body: JSON.stringify({ reservation_id: reservationId }),
          }
        );

        if (!scheduleResponse.ok) {
          const errorText = await scheduleResponse.text();
          logStep("Warning: Failed to schedule messages", { error: errorText });
        } else {
          const scheduleResult = await scheduleResponse.json();
          logStep("Messages scheduled successfully", scheduleResult);
        }

        // Also trigger immediate processing of scheduled messages
        const processResponse = await fetch(
          `${Deno.env.get("SUPABASE_URL")}/functions/v1/process-scheduled-messages`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
            },
            body: JSON.stringify({}),
          }
        );

        if (processResponse.ok) {
          const processResult = await processResponse.json();
          logStep("Messages processed", processResult);
        }
      } catch (emailError) {
        // Don't fail the payment verification if email scheduling fails
        logStep("Warning: Error scheduling confirmation email", { error: String(emailError) });
      }
    }

    return new Response(JSON.stringify({ 
      paymentStatus, 
      bookingStatus,
      sessionStatus: session.status 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in verify-payment", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
