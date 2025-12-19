import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { generateWorkOrderEmailContent } from "./emailTemplate.ts";
import { sendWorkOrderEmail } from "./emailService.ts";
import { fetchWorkOrderWithDetails, updateWorkOrderStatus } from "./workOrderService.ts";
import { decryptApiKey, isEncrypted } from "../_shared/encryption.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function resolveResendApiKey(supabase: any, workOrder: any): Promise<string> {
  // Prefer explicit work_order.organization_id, fallback to property.organization_id
  const organizationId = workOrder?.organization_id ?? workOrder?.property?.organization_id;

  let candidate = "";
  let source: "organization" | "env" | "none" = "none";

  if (organizationId) {
    console.log("Resolving Resend API key for organization:", organizationId);

    const { data: org, error: orgError } = await supabase
      .from("organizations")
      .select("resend_api_key")
      .eq("id", organizationId)
      .maybeSingle();

    if (orgError) {
      console.error("Error fetching organization resend_api_key:", orgError);
    }

    if (org?.resend_api_key) {
      candidate = String(org.resend_api_key).trim();
      source = "organization";
    }
  } else {
    console.log("No organization id found on work order; will try environment key");
  }

  if (!candidate) {
    candidate = (Deno.env.get("RESEND_API_KEY") || "").trim();
    source = candidate ? "env" : "none";
  }

  if (!candidate) {
    throw new Error(
      "No Resend API key configured. Please add your Resend API key in Organization Settings > Communications."
    );
  }

  // If already plaintext Resend key, use it
  if (candidate.startsWith("re_")) {
    console.log("Resolved Resend API key source:", source);
    return candidate;
  }

  // Otherwise attempt to decrypt (org keys are stored encrypted-at-rest)
  try {
    if (isEncrypted(candidate) || source === "organization") {
      console.log("Attempting to decrypt Resend API key (source:", source, ")");
      const decrypted = (await decryptApiKey(candidate)).trim();
      if (decrypted.startsWith("re_")) {
        console.log("Resolved Resend API key source:", source);
        return decrypted;
      }
    }
  } catch (e) {
    console.error("Failed to decrypt Resend API key:", e);
  }

  // Last resort: treat as invalid
  throw new Error(
    "Resend API key is invalid or could not be decrypted. Please re-save it in Organization Settings > Communications."
  );
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { workOrderId } = await req.json();

    if (!workOrderId) {
      throw new Error("Work order ID is required");
    }

    console.log("Starting email send process for work order:", workOrderId);

    // Fetch work order details
    const workOrder = await fetchWorkOrderWithDetails(supabase, workOrderId);

    console.log("Fetched work order:", {
      id: workOrder.id,
      number: workOrder.work_order_number,
      title: workOrder.title,
      contractor: workOrder.contractor?.email,
      organization_id: workOrder.organization_id ?? workOrder.property?.organization_id ?? null,
    });

    // Create acknowledgment record with unique token
    const token = crypto.randomUUID();
    const { error: ackError } = await supabase
      .from("work_order_acknowledgments")
      .insert({
        work_order_id: workOrderId,
        contractor_id: workOrder.contractor?.id || null,
        token: token,
      });

    if (ackError) {
      console.error("Error creating acknowledgment record:", ackError);
      // Continue anyway - email can still be sent
    }

    // Generate acknowledge URL
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const acknowledgeUrl = `${supabaseUrl}/functions/v1/acknowledge-work-orders?token=${token}`;
    console.log("Acknowledge URL generated:", acknowledgeUrl);

    // Generate email content with acknowledge URL
    const emailContent = generateWorkOrderEmailContent(workOrder, acknowledgeUrl);

    console.log("Email content generated successfully, length:", emailContent.length);

    // Resolve key
    const resendApiKey = await resolveResendApiKey(supabase, workOrder);

    // Send email via Resend
    console.log("Sending email to contractor:", workOrder.contractor?.email);
    await sendWorkOrderEmail(workOrder, emailContent, resendApiKey);

    // Update work order status if needed
    await updateWorkOrderStatus(supabase, workOrderId, workOrder.status);

    console.log("Work order email sent successfully");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Work order email sent successfully",
        workOrderNumber: workOrder.work_order_number,
        contractorEmail: workOrder.contractor?.email,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in send-work-order-pdf function:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
