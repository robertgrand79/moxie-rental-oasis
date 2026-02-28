import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-CONNECT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    // Authenticate user
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
    if (claimsError || !claimsData?.claims) {
      throw new Error("Unauthorized");
    }
    const userId = claimsData.claims.sub;
    logStep("User authenticated", { userId });

    const { organizationId, returnUrl } = await req.json();
    if (!organizationId) throw new Error("organizationId is required");

    // Service client for DB writes
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Verify user is org owner/manager
    const { data: membership } = await serviceClient
      .from("organization_members")
      .select("role, team_role")
      .eq("user_id", userId)
      .eq("organization_id", organizationId)
      .single();

    if (!membership || (membership.team_role !== "owner" && membership.team_role !== "manager" && membership.role !== "owner")) {
      throw new Error("Only owners and managers can connect Stripe");
    }
    logStep("Authorization verified");

    const platformStripeKey = Deno.env.get("PLATFORM_STRIPE_SECRET_KEY");
    if (!platformStripeKey) throw new Error("Platform Stripe not configured");

    const stripe = new Stripe(platformStripeKey, { apiVersion: "2023-10-16" });

    // Check if org already has a Connect account
    const { data: org } = await serviceClient
      .from("organizations")
      .select("stripe_connect_id, name")
      .eq("id", organizationId)
      .single();

    let accountId = org?.stripe_connect_id;

    if (!accountId) {
      // Create a Standard Connect account
      const account = await stripe.accounts.create({
        type: "standard",
        metadata: {
          organization_id: organizationId,
        },
      });
      accountId = account.id;
      logStep("Stripe Connect account created", { accountId });

      // Save to DB
      await serviceClient
        .from("organizations")
        .update({
          stripe_connect_id: accountId,
          stripe_connect_status: "pending",
        })
        .eq("id", organizationId);
    }

    // Generate account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${returnUrl}?stripe_connect=refresh`,
      return_url: `${returnUrl}?stripe_connect=complete`,
      type: "account_onboarding",
    });

    logStep("Account link generated", { url: accountLink.url });

    return new Response(
      JSON.stringify({ url: accountLink.url, accountId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: error.message === "Unauthorized" ? 401 : 500 }
    );
  }
});
