import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { Resend } from "npm:resend@6.9.4";
import { generateBulkWorkOrderEmailContent } from "./emailTemplate.ts";
import { decryptApiKey, isEncrypted } from "../_shared/encryption.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function resolveResendApiKey(supabase: any, organizationId: string): Promise<string> {
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

  if (candidate.startsWith("re_")) {
    console.log("Resolved Resend API key source:", source);
    return candidate;
  }

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

    const { workOrderIds, contractorId } = await req.json();

    if (!workOrderIds || !Array.isArray(workOrderIds) || workOrderIds.length === 0) {
      throw new Error("Work order IDs array is required");
    }

    if (!contractorId) {
      throw new Error("Contractor ID is required");
    }

    console.log("Starting bulk email send for work orders:", workOrderIds, "to contractor:", contractorId);

    // Fetch contractor details
    const { data: contractor, error: contractorError } = await supabase
      .from("contractors")
      .select("*")
      .eq("id", contractorId)
      .single();

    if (contractorError || !contractor) {
      throw new Error("Contractor not found");
    }

    if (!contractor.email) {
      throw new Error("Contractor does not have an email address");
    }

    console.log("Contractor:", contractor.name, contractor.email);

    // Fetch all work orders with details
    const { data: workOrders, error: workOrdersError } = await supabase
      .from("work_orders")
      .select(`
        *,
        property:properties(id, title, location, organization_id),
        contractor:contractors(id, name, email, company_name, phone)
      `)
      .in("id", workOrderIds);

    if (workOrdersError || !workOrders || workOrders.length === 0) {
      throw new Error("Failed to fetch work orders");
    }

    console.log("Fetched", workOrders.length, "work orders");

    // Get organization ID from first work order
    const organizationId = workOrders[0].organization_id ?? workOrders[0].property?.organization_id;

    if (!organizationId) {
      throw new Error("Could not determine organization for work orders");
    }

    // Generate unique acknowledgment token
    const token = crypto.randomUUID();

    // Create acknowledgment record
    const { error: ackError } = await supabase
      .from("work_order_acknowledgments")
      .insert({
        token,
        work_order_ids: workOrderIds,
        contractor_id: contractorId,
        organization_id: organizationId,
      });

    if (ackError) {
      console.error("Error creating acknowledgment record:", ackError);
      throw new Error("Failed to create acknowledgment record");
    }

    console.log("Created acknowledgment token:", token);

    // Generate acknowledge URL using custom domain
    const apiDomain = "https://api.staymoxie.com";
    const acknowledgeUrl = `${apiDomain}/functions/v1/acknowledge-work-orders?token=${token}`;

    // Generate email content
    const emailContent = generateBulkWorkOrderEmailContent(workOrders, contractor, acknowledgeUrl);

    console.log("Email content generated, length:", emailContent.length);

    // Resolve Resend API key
    const resendApiKey = await resolveResendApiKey(supabase, organizationId);
    const resend = new Resend(resendApiKey);

    // Send email
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: "Moxie Vacation Rentals <team@moxievacationrentals.com>",
      to: [contractor.email],
      subject: `Work Orders Assigned: ${workOrders.length} order${workOrders.length > 1 ? 's' : ''} ready for you`,
      html: emailContent,
    });

    if (emailError) {
      console.error("Failed to send email:", emailError);
      throw new Error(`Failed to send email: ${emailError.message}`);
    }

    console.log("Email sent successfully:", emailData);

    // Update all work orders: set status to 'sent' and set sent_at
    const { error: updateError } = await supabase
      .from("work_orders")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
        contractor_id: contractorId,
      })
      .in("id", workOrderIds);

    if (updateError) {
      console.error("Error updating work orders:", updateError);
    }

    console.log("Work orders updated to 'sent' status");

    return new Response(
      JSON.stringify({
        success: true,
        message: `Sent ${workOrders.length} work order(s) to ${contractor.name}`,
        contractorEmail: contractor.email,
        workOrderCount: workOrders.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in send-bulk-work-orders function:", error);
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
