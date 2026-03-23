import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@6.9.4";
import { decryptApiKey, isEncrypted } from "../_shared/encryption.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DeliverEscalationRequest {
  escalationId: string;
  deliveryMethods: ('email' | 'sms')[];
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { escalationId, deliveryMethods }: DeliverEscalationRequest = await req.json();

    console.log("[deliver-escalation-response] Request received:", { escalationId, deliveryMethods });

    if (!escalationId) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing escalationId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch escalation details
    const { data: escalation, error: escalationError } = await supabase
      .from("assistant_escalations")
      .select("*")
      .eq("id", escalationId)
      .single();

    if (escalationError || !escalation) {
      console.error("[deliver-escalation-response] Escalation not found:", escalationError);
      return new Response(
        JSON.stringify({ success: false, error: "Escalation not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (escalation.status !== 'answered' || !escalation.host_response) {
      return new Response(
        JSON.stringify({ success: false, error: "Escalation has no response to deliver" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const guestEmail = escalation.guest_email;
    const guestPhone = escalation.guest_phone;
    const guestName = escalation.guest_name || 'Guest';
    const hostResponse = escalation.host_response;
    const guestQuestion = escalation.guest_question;
    const organizationId = escalation.organization_id;

    const deliveryResults = {
      email: { attempted: false, success: false, error: null as string | null },
      sms: { attempted: false, success: false, error: null as string | null }
    };

    // Fetch organization settings for email
    let siteName = "Moxie Vacation Rentals";
    let fromEmail = "noreply@moxievacationrentals.com";
    let fromName = "Moxie Vacation Rentals";
    let replyTo = "reply@inbound.moxievacationrentals.com";
    let emailHeaderColor = "#3b82f6";
    let emailHeaderColorEnd = "#1d4ed8";
    let emailFooterColor = "#f8fafc";

    if (organizationId) {
      const { data: settings } = await supabase
        .from("site_settings")
        .select("key, value")
        .eq("organization_id", organizationId)
        .in("key", [
          "emailFromAddress", "emailFromName", "emailReplyTo", "siteName",
          "emailHeaderColor", "emailHeaderColorEnd", "emailFooterColor"
        ]);

      if (settings) {
        const settingsMap = settings.reduce((acc: Record<string, string>, s: { key: string; value: string }) => {
          acc[s.key] = typeof s.value === 'string' ? s.value.replace(/^"|"$/g, '') : s.value;
          return acc;
        }, {});

        siteName = settingsMap.siteName || siteName;
        fromEmail = settingsMap.emailFromAddress || fromEmail;
        fromName = settingsMap.siteName || settingsMap.emailFromName || fromName;
        replyTo = settingsMap.emailReplyTo || replyTo;
        emailHeaderColor = settingsMap.emailHeaderColor || emailHeaderColor;
        emailHeaderColorEnd = settingsMap.emailHeaderColorEnd || emailHeaderColorEnd;
        emailFooterColor = settingsMap.emailFooterColor || emailFooterColor;
      }
    }

    // Send email if requested and email is available
    if (deliveryMethods.includes('email') && guestEmail) {
      deliveryResults.email.attempted = true;
      
      try {
        // Get Resend API key
        let resendApiKey = "";
        
        if (organizationId) {
          const { data: org } = await supabase
            .from("organizations")
            .select("resend_api_key")
            .eq("id", organizationId)
            .single();

          if (org?.resend_api_key) {
            resendApiKey = org.resend_api_key;
            if (isEncrypted(resendApiKey)) {
              try {
                resendApiKey = await decryptApiKey(resendApiKey);
              } catch {
                resendApiKey = "";
              }
            }
          }
        }

        if (!resendApiKey) {
          resendApiKey = Deno.env.get("RESEND_API_KEY") || "";
        }

        if (resendApiKey) {
          const resend = new Resend(resendApiKey);

          const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Response to Your Question</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
  <div style="background: linear-gradient(135deg, ${emailHeaderColor} 0%, ${emailHeaderColorEnd} 100%); padding: 30px; border-radius: 12px 12px 0 0;">
    <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">${siteName}</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0; font-size: 14px;">Response to Your Question</p>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
    <p style="margin-top: 0; color: #374151;">Hi ${guestName},</p>
    
    <p style="color: #374151;">Thank you for reaching out! Here's the response to your question:</p>
    
    <div style="margin: 20px 0; padding: 16px; background: #f3f4f6; border-radius: 8px; border-left: 4px solid #9ca3af;">
      <p style="margin: 0; font-weight: 600; color: #6b7280; font-size: 13px;">Your question:</p>
      <p style="margin: 8px 0 0 0; color: #374151;">${guestQuestion}</p>
    </div>
    
    <div style="margin: 20px 0; padding: 16px; background: #eff6ff; border-radius: 8px; border-left: 4px solid ${emailHeaderColor};">
      <p style="margin: 0; font-weight: 600; color: #1e40af; font-size: 13px;">Our response:</p>
      <p style="margin: 8px 0 0 0; color: #374151; white-space: pre-wrap;">${hostResponse}</p>
    </div>
    
    <p style="color: #6b7280; font-size: 14px;">If you have any more questions, feel free to reply to this email or continue chatting with our assistant.</p>
  </div>
  
  <div style="background: ${emailFooterColor}; padding: 24px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb; border-top: none; text-align: center;">
    <p style="margin: 0; font-weight: 600; color: #374151; font-size: 15px;">${siteName}</p>
    <p style="margin: 8px 0 0; color: #9ca3af; font-size: 12px;">
      Simply reply to this email if you have any questions.
    </p>
  </div>
</body>
</html>`;

          const emailResponse = await resend.emails.send({
            from: `${fromName} <${fromEmail}>`,
            to: [guestEmail],
            reply_to: replyTo,
            subject: `Response to Your Question - ${siteName}`,
            html: htmlContent,
          });

          if (emailResponse.error) {
            deliveryResults.email.error = emailResponse.error.message;
          } else {
            deliveryResults.email.success = true;
            console.log("[deliver-escalation-response] Email sent successfully");
          }
        } else {
          deliveryResults.email.error = "No Resend API key configured";
        }
      } catch (emailError: any) {
        console.error("[deliver-escalation-response] Email error:", emailError);
        deliveryResults.email.error = emailError.message;
      }
    }

    // Send SMS if requested and phone is available
    if (deliveryMethods.includes('sms') && guestPhone) {
      deliveryResults.sms.attempted = true;
      
      try {
        // Call the existing send-sms edge function
        const smsMessage = `Hi ${guestName}! Here's our response to your question: "${guestQuestion.substring(0, 50)}${guestQuestion.length > 50 ? '...' : ''}"\n\n${hostResponse}\n\n- ${siteName}`;
        
        const { data: smsResult, error: smsError } = await supabase.functions.invoke('send-sms', {
          body: {
            to: guestPhone,
            message: smsMessage,
            organizationId: organizationId
          }
        });

        if (smsError) {
          console.error("[deliver-escalation-response] SMS error:", smsError);
          deliveryResults.sms.error = smsError.message;
        } else if (smsResult?.success) {
          deliveryResults.sms.success = true;
          console.log("[deliver-escalation-response] SMS sent successfully");
        } else {
          deliveryResults.sms.error = smsResult?.error || "SMS sending failed";
        }
      } catch (smsError: any) {
        console.error("[deliver-escalation-response] SMS error:", smsError);
        deliveryResults.sms.error = smsError.message;
      }
    }

    // Update escalation with notified_at timestamp if any delivery succeeded
    if (deliveryResults.email.success || deliveryResults.sms.success) {
      await supabase
        .from("assistant_escalations")
        .update({ notified_at: new Date().toISOString() })
        .eq("id", escalationId);
    }

    const anySuccess = deliveryResults.email.success || deliveryResults.sms.success;
    const summary = [];
    if (deliveryResults.email.attempted) {
      summary.push(`Email: ${deliveryResults.email.success ? 'sent' : `failed (${deliveryResults.email.error})`}`);
    }
    if (deliveryResults.sms.attempted) {
      summary.push(`SMS: ${deliveryResults.sms.success ? 'sent' : `failed (${deliveryResults.sms.error})`}`);
    }

    console.log("[deliver-escalation-response] Delivery complete:", summary.join(', '));

    return new Response(
      JSON.stringify({
        success: anySuccess,
        results: deliveryResults,
        message: summary.join(', ')
      }),
      { status: anySuccess ? 200 : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("[deliver-escalation-response] Unexpected error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
