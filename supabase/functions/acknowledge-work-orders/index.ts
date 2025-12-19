import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Base URL for redirects
const BASE_URL = "https://moxievacationrentals.com";

function redirect(path: string): Response {
  return new Response(null, {
    status: 302,
    headers: { ...corsHeaders, Location: `${BASE_URL}${path}` }
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      console.log("No token provided");
      return redirect(`/acknowledge?status=error&message=${encodeURIComponent("Invalid acknowledgment link")}`);
    }

    console.log("Processing acknowledgment for token:", token);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch acknowledgment record
    const { data: ackRecord, error: ackError } = await supabase
      .from("work_order_acknowledgments")
      .select("*, contractor:contractors(name)")
      .eq("token", token)
      .single();

    if (ackError || !ackRecord) {
      console.error("Acknowledgment record not found:", ackError);
      return redirect(`/acknowledge?status=error&message=${encodeURIComponent("This link is invalid or has expired")}`);
    }

    const contractorName = ackRecord.contractor?.name || "Contractor";

    // Check if already acknowledged
    if (ackRecord.acknowledged_at) {
      console.log("Already acknowledged at:", ackRecord.acknowledged_at);
      return redirect(`/acknowledge?status=already&name=${encodeURIComponent(contractorName)}`);
    }

    const now = new Date().toISOString();

    // Update acknowledgment record
    const { error: updateAckError } = await supabase
      .from("work_order_acknowledgments")
      .update({ acknowledged_at: now })
      .eq("id", ackRecord.id);

    if (updateAckError) {
      console.error("Error updating acknowledgment record:", updateAckError);
    }

    // Update all work orders
    const { error: updateWoError } = await supabase
      .from("work_orders")
      .update({
        status: "acknowledged",
        acknowledged_at: now,
      })
      .in("id", ackRecord.work_order_ids);

    if (updateWoError) {
      console.error("Error updating work orders:", updateWoError);
    }

    const count = ackRecord.work_order_ids?.length || 1;
    console.log("Successfully acknowledged", count, "work orders for", contractorName);

    // Get contractor's portal access token
    const { data: portalToken } = await supabase.rpc('get_or_create_contractor_token', {
      p_contractor_id: ackRecord.contractor_id
    });

    const workOrderIds = ackRecord.work_order_ids?.join(',') || '';

    return redirect(`/acknowledge?status=success&name=${encodeURIComponent(contractorName)}&count=${count}&portalToken=${portalToken || ''}&workOrderIds=${workOrderIds}`);
  } catch (error) {
    console.error("Error in acknowledge-work-orders function:", error);
    return redirect(`/acknowledge?status=error&message=${encodeURIComponent("Something went wrong")}`);
  }
});
