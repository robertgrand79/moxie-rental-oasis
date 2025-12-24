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

// Helper to check if event was already processed (idempotency)
async function checkEventProcessed(supabaseClient: any, eventId: string): Promise<boolean> {
  const { data } = await supabaseClient
    .from('stripe_webhook_events')
    .select('id')
    .eq('stripe_event_id', eventId)
    .single();
  return !!data;
}

// Helper to mark event as processed
async function markEventProcessed(supabaseClient: any, eventId: string, eventType: string, metadata: any): Promise<void> {
  await supabaseClient
    .from('stripe_webhook_events')
    .insert({
      stripe_event_id: eventId,
      event_type: eventType,
      metadata,
      processed_at: new Date().toISOString()
    });
}

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

    logStep("Event parsed", { type: event.type, id: event.id });

    // Idempotency check - skip if already processed
    const alreadyProcessed = await checkEventProcessed(supabaseClient, event.id);
    if (alreadyProcessed) {
      logStep("Event already processed, skipping", { eventId: event.id });
      return new Response(JSON.stringify({ received: true, skipped: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Get metadata to determine which Stripe account to verify against
    const metadata = (event.data.object as any).metadata || {};
    const reservationId = metadata.reservationId;
    const propertyId = metadata.propertyId;
    const stripeAccountId = metadata.stripeAccountId;

    logStep("Metadata extracted", { reservationId, propertyId, stripeAccountId });

    // Determine which webhook secret to use for verification
    let webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    let stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    
    if (propertyId) {
      // Check property-specific credentials from secure table
      const { data: propertyCredentials } = await supabaseClient
        .rpc('get_property_stripe_credentials', { p_property_id: propertyId });

      if (propertyCredentials && propertyCredentials.length > 0) {
        const creds = propertyCredentials[0];
        if (creds.stripe_webhook_secret) {
          webhookSecret = creds.stripe_webhook_secret;
          logStep("Using property-specific webhook secret");
        }
        if (creds.stripe_secret_key) {
          stripeKey = creds.stripe_secret_key;
          logStep("Using property-specific Stripe key");
        }
      }
      
      // Fallback to organization credentials
      if (!webhookSecret || webhookSecret === Deno.env.get("STRIPE_WEBHOOK_SECRET")) {
        const { data: property } = await supabaseClient
          .from('properties')
          .select('organization_id')
          .eq('id', propertyId)
          .single();

        if (property?.organization_id) {
          const { data: org } = await supabaseClient
            .from('organizations')
            .select('stripe_webhook_secret, stripe_secret_key')
            .eq('id', property.organization_id)
            .single();

          if (org?.stripe_webhook_secret) {
            webhookSecret = org.stripe_webhook_secret;
            logStep("Using organization webhook secret");
          }
          if (org?.stripe_secret_key) {
            stripeKey = org.stripe_secret_key;
            logStep("Using organization Stripe key");
          }
        }
      }
    }

    if (!webhookSecret) {
      throw new Error("No webhook secret configured");
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

    // Helper function to get organization ID from property
    const getOrganizationId = async (propId: string): Promise<string | null> => {
      const { data: prop } = await supabaseClient
        .from('properties')
        .select('organization_id')
        .eq('id', propId)
        .single();
      return prop?.organization_id || null;
    };

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

        // Get reservation details to create availability block and notifications
        const { data: reservation, error: fetchError } = await supabaseClient
          .from("property_reservations")
          .select("check_in_date, check_out_date, guest_name, guest_email, total_amount, property_id")
          .eq("id", reservationId)
          .single();

        if (fetchError) {
          logStep("Error fetching reservation for availability block", fetchError);
        } else if (reservation) {
          const effectivePropertyId = propertyId || reservation.property_id;
          
          if (effectivePropertyId) {
            // Create availability block for direct booking
            const { error: blockError } = await supabaseClient
              .from("availability_blocks")
              .insert({
                property_id: effectivePropertyId,
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
              logStep("Availability block created", { reservationId, propertyId: effectivePropertyId });
            }

            // Create notifications for new booking and payment
            const organizationId = await getOrganizationId(effectivePropertyId);
            if (organizationId) {
              // Get property name for notification
              const { data: propertyData } = await supabaseClient
                .from('properties')
                .select('name')
                .eq('id', effectivePropertyId)
                .single();
              const propertyName = propertyData?.name || 'Property';

              // Create new booking notification
              await supabaseClient.from('admin_notifications').insert({
                organization_id: organizationId,
                user_id: null,
                notification_type: 'new_booking',
                category: 'bookings',
                title: 'New Booking Confirmed',
                message: `${reservation.guest_name} booked ${propertyName} for ${reservation.check_in_date} to ${reservation.check_out_date}`,
                action_url: `/admin/host/bookings`,
                priority: 'high',
                metadata: {
                  reservation_id: reservationId,
                  property_id: effectivePropertyId,
                  guest_name: reservation.guest_name,
                  guest_email: reservation.guest_email,
                  check_in: reservation.check_in_date,
                  check_out: reservation.check_out_date,
                  total_amount: reservation.total_amount
                }
              });
              logStep("New booking notification created");

              // Create payment received notification
              await supabaseClient.from('admin_notifications').insert({
                organization_id: organizationId,
                user_id: null,
                notification_type: 'payment_received',
                category: 'payments',
                title: 'Payment Received',
                message: `$${reservation.total_amount?.toFixed(2) || '0.00'} received from ${reservation.guest_name} for ${propertyName}`,
                action_url: `/admin/host/bookings`,
                priority: 'normal',
                metadata: {
                  reservation_id: reservationId,
                  property_id: effectivePropertyId,
                  amount: reservation.total_amount,
                  guest_name: reservation.guest_name,
                  stripe_session_id: session.id
                }
              });
              logStep("Payment received notification created");

              // Create guest notification for booking confirmation
              const { data: guestProfile } = await supabaseClient
                .from('guest_profiles')
                .select('id')
                .eq('email', reservation.guest_email?.toLowerCase())
                .single();

              if (guestProfile) {
                await supabaseClient.from('guest_notifications').insert({
                  guest_profile_id: guestProfile.id,
                  reservation_id: reservationId,
                  notification_type: 'booking_confirmed',
                  title: 'Booking Confirmed!',
                  message: `Your reservation at ${propertyName} from ${reservation.check_in_date} to ${reservation.check_out_date} is confirmed.`,
                  action_url: `/guest/reservations/${reservationId}`,
                  sent_at: new Date().toISOString(),
                });
                logStep("Guest booking notification created");
              }
            }
          }
        }
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Processing checkout.session.expired", { sessionId: session.id });

        if (reservationId) {
          // Delete abandoned reservation instead of marking as failed
          const { error: deleteError } = await supabaseClient
            .from("property_reservations")
            .delete()
            .eq("id", reservationId)
            .eq("payment_status", "pending"); // Only delete if still pending

          if (deleteError) {
            logStep("Error deleting abandoned reservation", deleteError);
          } else {
            logStep("Abandoned reservation deleted", { reservationId });
          }
        }
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        logStep("Processing payment_intent.succeeded", { paymentIntentId: paymentIntent.id });
        // This confirms payment was successful - reservation should already be updated by checkout.session.completed
        // Log for audit trail
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        logStep("Processing payment_intent.payment_failed", { 
          paymentIntentId: paymentIntent.id,
          lastPaymentError: paymentIntent.last_payment_error?.message 
        });

        if (reservationId) {
          // Get reservation details before updating
          const { data: reservation } = await supabaseClient
            .from("property_reservations")
            .select("guest_name, guest_email, property_id, total_amount")
            .eq("id", reservationId)
            .single();

          const { error: updateError } = await supabaseClient
            .from("property_reservations")
            .update({ 
              payment_status: "failed",
              payment_notes: paymentIntent.last_payment_error?.message || 'Payment failed'
            })
            .eq("id", reservationId);

          if (updateError) {
            logStep("Error updating reservation", updateError);
          }

          // Create payment failed notification
          if (reservation?.property_id) {
            const organizationId = await getOrganizationId(reservation.property_id);
            if (organizationId) {
              const { data: propertyData } = await supabaseClient
                .from('properties')
                .select('name')
                .eq('id', reservation.property_id)
                .single();
              const propertyName = propertyData?.name || 'Property';

              await supabaseClient.from('admin_notifications').insert({
                organization_id: organizationId,
                user_id: null,
                notification_type: 'payment_failed',
                category: 'payments',
                title: 'Payment Failed',
                message: `Payment of $${reservation.total_amount?.toFixed(2) || '0.00'} failed for ${reservation.guest_name} at ${propertyName}`,
                action_url: `/admin/host/bookings`,
                priority: 'urgent',
                metadata: {
                  reservation_id: reservationId,
                  property_id: reservation.property_id,
                  guest_name: reservation.guest_name,
                  guest_email: reservation.guest_email,
                  amount: reservation.total_amount,
                  stripe_payment_intent_id: paymentIntent.id,
                  error_message: paymentIntent.last_payment_error?.message
                }
              });
              logStep("Payment failed notification created");
            }
          }
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        logStep("Processing charge.refunded", { chargeId: charge.id, amount: charge.amount_refunded });
        
        // Find reservation by payment intent or session
        const paymentIntentId = charge.payment_intent as string;
        if (paymentIntentId) {
          const { data: reservation } = await supabaseClient
            .from("property_reservations")
            .select("id, property_id, guest_name, total_amount")
            .eq("stripe_payment_intent_id", paymentIntentId)
            .single();

          if (reservation) {
            const refundAmount = charge.amount_refunded / 100;
            const isFullRefund = charge.refunded;

            await supabaseClient
              .from("property_reservations")
              .update({ 
                payment_status: isFullRefund ? "refunded" : "partially_refunded",
                refund_amount: refundAmount
              })
              .eq("id", reservation.id);

            // Create refund notification
            if (reservation.property_id) {
              const organizationId = await getOrganizationId(reservation.property_id);
              if (organizationId) {
                await supabaseClient.from('admin_notifications').insert({
                  organization_id: organizationId,
                  user_id: null,
                  notification_type: 'payment_refunded',
                  category: 'payments',
                  title: isFullRefund ? 'Full Refund Processed' : 'Partial Refund Processed',
                  message: `$${refundAmount.toFixed(2)} refunded for ${reservation.guest_name}'s booking`,
                  action_url: `/admin/host/bookings`,
                  priority: 'normal',
                  metadata: {
                    reservation_id: reservation.id,
                    refund_amount: refundAmount,
                    is_full_refund: isFullRefund
                  }
                });
              }
            }
            logStep("Refund processed", { reservationId: reservation.id, amount: refundAmount });
          }
        }
        break;
      }

      case "charge.dispute.created": {
        const dispute = event.data.object as Stripe.Dispute;
        logStep("Processing charge.dispute.created", { disputeId: dispute.id, amount: dispute.amount });
        
        // Alert admin about dispute - this is urgent
        const chargeId = dispute.charge as string;
        if (chargeId) {
          // Try to find the associated reservation
          const charge = await stripe.charges.retrieve(chargeId);
          const paymentIntentId = charge.payment_intent as string;
          
          if (paymentIntentId) {
            const { data: reservation } = await supabaseClient
              .from("property_reservations")
              .select("id, property_id, guest_name")
              .eq("stripe_payment_intent_id", paymentIntentId)
              .single();

            if (reservation?.property_id) {
              const organizationId = await getOrganizationId(reservation.property_id);
              if (organizationId) {
                await supabaseClient.from('admin_notifications').insert({
                  organization_id: organizationId,
                  user_id: null,
                  notification_type: 'payment_dispute',
                  category: 'payments',
                  title: '⚠️ Payment Dispute Opened',
                  message: `A dispute for $${(dispute.amount / 100).toFixed(2)} has been opened for ${reservation.guest_name}'s booking. Respond within ${dispute.evidence_details?.due_by ? 'the deadline' : '7 days'}.`,
                  action_url: `https://dashboard.stripe.com/disputes/${dispute.id}`,
                  priority: 'urgent',
                  metadata: {
                    reservation_id: reservation.id,
                    dispute_id: dispute.id,
                    dispute_amount: dispute.amount / 100,
                    dispute_reason: dispute.reason
                  }
                });
                logStep("Dispute notification created");
              }
            }
          }
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    // Mark event as processed for idempotency
    await markEventProcessed(supabaseClient, event.id, event.type, metadata);

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
