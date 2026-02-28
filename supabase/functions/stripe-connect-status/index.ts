import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      throw new Error("Unauthorized");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) throw new Error("Unauthorized");

    const { organizationId } = await req.json();
    if (!organizationId) throw new Error("organizationId required");

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { data: org } = await serviceClient
      .from("organizations")
      .select("stripe_connect_id, stripe_connect_status, payments_enabled")
      .eq("id", organizationId)
      .single();

    if (!org?.stripe_connect_id) {
      return new Response(
        JSON.stringify({ status: "not_connected", payments_enabled: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check live status from Stripe
    const platformStripeKey = Deno.env.get("PLATFORM_STRIPE_SECRET_KEY");
    if (!platformStripeKey) throw new Error("Platform Stripe not configured");

    const stripe = new Stripe(platformStripeKey, { apiVersion: "2023-10-16" });
    const account = await stripe.accounts.retrieve(org.stripe_connect_id);

    const isActive = account.charges_enabled && account.payouts_enabled;
    const status = isActive ? "active" : account.details_submitted ? "pending_verification" : "pending";

    // Sync status to DB if changed
    if (status !== org.stripe_connect_status || isActive !== org.payments_enabled) {
      await serviceClient
        .from("organizations")
        .update({
          stripe_connect_status: status,
          payments_enabled: isActive,
        })
        .eq("id", organizationId);
    }

    return new Response(
      JSON.stringify({
        status,
        payments_enabled: isActive,
        charges_enabled: account.charges_enabled,
        payouts_enabled: account.payouts_enabled,
        details_submitted: account.details_submitted,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: msg }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
