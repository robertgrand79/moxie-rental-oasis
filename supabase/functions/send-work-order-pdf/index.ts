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

    const { workOrderId, sendMethod = 'both' } = await req.json();
    // sendMethod can be 'email', 'sms', or 'both' (default)

    if (!workOrderId) {
      throw new Error("Work order ID is required");
    }

    console.log("Starting send process for work order:", workOrderId, "method:", sendMethod);

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
    const organizationId = workOrder.organization_id ?? workOrder.property?.organization_id ?? null;
    
    const { error: ackError } = await supabase
      .from("work_order_acknowledgments")
      .insert({
        work_order_ids: [workOrderId],  // Use array format to match table schema
        contractor_id: workOrder.contractor?.id || null,
        organization_id: organizationId,
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

    // Get or create contractor portal token
    let portalUrl: string | undefined;
    if (workOrder.contractor?.id) {
      const { data: portalToken, error: portalError } = await supabase
        .rpc('get_or_create_contractor_token', { p_contractor_id: workOrder.contractor.id });
      
      if (portalError) {
        console.error("Error getting contractor portal token:", portalError);
      } else if (portalToken) {
        portalUrl = `https://moxievacationrentals.com/contractor/${portalToken}`;
        console.log("Portal URL generated for contractor");
      }
    }

    // Generate email content with acknowledge URL and portal URL
    const emailContent = generateWorkOrderEmailContent(workOrder, acknowledgeUrl, portalUrl);

    console.log("Email content generated successfully, length:", emailContent.length);

    // Send email if requested
    let emailSent = false;
    if (sendMethod === 'email' || sendMethod === 'both') {
      // Resolve key
      const resendApiKey = await resolveResendApiKey(supabase, workOrder);

      // Send email via Resend
      console.log("Sending email to contractor:", workOrder.contractor?.email);
      await sendWorkOrderEmail(workOrder, emailContent, resendApiKey);
      emailSent = true;
      console.log("Work order email sent successfully");
    }

    // Update work order status if needed (if we sent anything)
    if (sendMethod === 'email' || sendMethod === 'both') {
      await updateWorkOrderStatus(supabase, workOrderId, workOrder.status);
    }

    // Send SMS notification if requested and contractor has a phone number
    let smsSent = false;
    let smsError: string | null = null;
    
    const shouldSendSms = (sendMethod === 'sms' || sendMethod === 'both') && 
      workOrder.contractor?.phone && 
      workOrder.contractor?.sms_opt_in !== false;

    if (shouldSendSms) {
      try {
        console.log("Sending SMS notification to contractor:", workOrder.contractor.phone);
        
        // Format short acknowledge URL
        const shortAckUrl = `${supabaseUrl.replace('https://', 'https://')}/functions/v1/acknowledge-work-orders?token=${token}`;
        
        // Build SMS message
        const propertyName = workOrder.property?.name || 'Property';
        const dueDate = workOrder.due_date 
          ? new Date(workOrder.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : 'ASAP';
        const priority = workOrder.priority || 'normal';
        
        const smsMessage = `🔧 New Work Order Assigned

${workOrder.work_order_number}: ${workOrder.title}
📍 ${propertyName}
📅 Due: ${dueDate}
⚡ Priority: ${priority.charAt(0).toUpperCase() + priority.slice(1)}

Tap to Acknowledge: ${shortAckUrl}`;

        // Call send-sms edge function
        const smsResponse = await fetch(`${supabaseUrl}/functions/v1/send-sms`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          },
          body: JSON.stringify({
            to: workOrder.contractor.phone,
            message: smsMessage,
            organizationId: organizationId,
          }),
        });

        if (smsResponse.ok) {
          smsSent = true;
          console.log("SMS notification sent successfully");
          
          // Update work order status if only SMS was sent
          if (sendMethod === 'sms') {
            await updateWorkOrderStatus(supabase, workOrderId, workOrder.status);
          }
        } else {
          const smsResult = await smsResponse.json();
          smsError = smsResult.error || 'Failed to send SMS';
          console.error("SMS notification failed:", smsError);
        }
      } catch (err) {
        smsError = err.message;
        console.error("Error sending SMS notification:", err);
      }
    } else if (sendMethod === 'sms') {
      console.log("SMS requested but skipped - no phone number or contractor opted out");
      smsError = "No phone number available or contractor opted out of SMS";
    }

    // Build success message based on what was sent
    let message = "";
    if (emailSent && smsSent) {
      message = "Work order sent via email and SMS";
    } else if (emailSent) {
      message = "Work order email sent successfully";
    } else if (smsSent) {
      message = "Work order SMS sent successfully";
    } else {
      message = "No notifications were sent";
    }

    return new Response(
      JSON.stringify({
        success: emailSent || smsSent,
        message,
        workOrderNumber: workOrder.work_order_number,
        contractorEmail: workOrder.contractor?.email,
        emailSent,
        smsSent,
        smsError,
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
