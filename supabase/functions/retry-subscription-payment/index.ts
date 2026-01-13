import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Verify the request is from an authenticated platform admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    // Verify platform admin status
    const { data: adminCheck } = await supabaseClient
      .from("platform_admins")
      .select("id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (!adminCheck) {
      throw new Error("Not a platform admin");
    }

    const { paymentId } = await req.json();

    if (!paymentId) {
      throw new Error("Payment ID required");
    }

    // Get the failed payment record
    const { data: payment, error: paymentError } = await supabaseClient
      .from("platform_failed_payments")
      .select(`
        *,
        organization:organizations(stripe_customer_id)
      `)
      .eq("id", paymentId)
      .single();

    if (paymentError || !payment) {
      throw new Error("Failed payment not found");
    }

    // Get the platform Stripe secret key
    const { data: stripeConfig } = await supabaseClient
      .from("platform_settings")
      .select("value")
      .eq("key", "stripe_secret_key")
      .single();

    if (!stripeConfig?.value) {
      throw new Error("Platform Stripe not configured");
    }

    const stripe = new Stripe(stripeConfig.value, {
      apiVersion: "2023-10-16",
    });

    // Pay the invoice
    const invoice = await stripe.invoices.pay(payment.stripe_invoice_id);

    if (invoice.status === "paid") {
      // Update the failed payment record
      await supabaseClient
        .from("platform_failed_payments")
        .update({
          status: "resolved",
          resolved_at: new Date().toISOString(),
          resolved_by: user.id,
          resolution_notes: "Payment successfully retried",
        })
        .eq("id", paymentId);

      return new Response(
        JSON.stringify({ success: true, invoice }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // Update attempt count
      await supabaseClient
        .from("platform_failed_payments")
        .update({
          status: "retrying",
          attempt_count: payment.attempt_count + 1,
          last_attempt_at: new Date().toISOString(),
        })
        .eq("id", paymentId);

      return new Response(
        JSON.stringify({ success: false, message: "Payment still pending", invoice }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error retrying payment:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
