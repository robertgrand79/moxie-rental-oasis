import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Template variable replacements
function processTemplate(template: string, variables: Record<string, string>): string {
  let processed = template;
  for (const [key, value] of Object.entries(variables)) {
    processed = processed.replace(new RegExp(`{{${key}}}`, "g"), value || "");
  }
  return processed;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const resend = resendApiKey ? new Resend(resendApiKey) : null;

    console.log("Processing scheduled messages...");

    // Get all pending messages that are due
    const now = new Date().toISOString();
    const { data: pendingMessages, error: fetchError } = await supabase
      .from("scheduled_messages")
      .select(`
        *,
        message_templates(name, subject, content),
        property_reservations(
          guest_name,
          guest_email,
          guest_phone,
          check_in_date,
          check_out_date,
          guest_count,
          property_id,
          properties(title, address, check_in_time, check_out_time)
        ),
        messaging_rules(delivery_channel)
      `)
      .eq("status", "pending")
      .lte("scheduled_for", now)
      .limit(50);

    if (fetchError) {
      console.error("Error fetching pending messages:", fetchError);
      throw fetchError;
    }

    console.log(`Found ${pendingMessages?.length || 0} pending messages to process`);

    if (!pendingMessages || pendingMessages.length === 0) {
      return new Response(
        JSON.stringify({ message: "No pending messages", processed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = { sent: 0, failed: 0, errors: [] as string[] };

    for (const message of pendingMessages) {
      try {
        const reservation = message.property_reservations;
        const template = message.message_templates;
        const rule = message.messaging_rules;

        if (!reservation || !template) {
          console.error(`Missing data for message ${message.id}`);
          await supabase
            .from("scheduled_messages")
            .update({ status: "failed", error_message: "Missing reservation or template data" })
            .eq("id", message.id);
          results.failed++;
          continue;
        }

        // Calculate nights count
        const checkIn = new Date(reservation.check_in_date);
        const checkOut = new Date(reservation.check_out_date);
        const nightsCount = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

        // Build template variables
        const variables: Record<string, string> = {
          guest_name: reservation.guest_name || "Guest",
          property_name: reservation.properties?.title || "Property",
          property_address: reservation.properties?.address || "",
          check_in_date: new Date(reservation.check_in_date).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          check_out_date: new Date(reservation.check_out_date).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          check_in_time: reservation.properties?.check_in_time || "3:00 PM",
          check_out_time: reservation.properties?.check_out_time || "11:00 AM",
          nights_count: nightsCount.toString(),
          guest_count: reservation.guest_count?.toString() || "1",
          wifi_network: "", // Could be fetched from property settings
          wifi_password: "", // Could be fetched from property settings
          door_code: "", // Could be fetched from reservation access codes
          guidebook_link: `${Deno.env.get("SITE_URL") || supabaseUrl}/guest/guidebook/${reservation.property_id}`,
        };

        // Process subject and content
        const subject = processTemplate(template.subject, variables);
        const content = processTemplate(template.content, variables);

        const deliveryChannel = rule?.delivery_channel || "email";
        let sent = false;
        let errorMessage = "";

        // Send email
        if ((deliveryChannel === "email" || deliveryChannel === "both") && reservation.guest_email) {
          if (resend) {
            try {
              // Convert plain text to HTML with line breaks
              const htmlContent = content.replace(/\n/g, "<br>");
              
              const emailResult = await resend.emails.send({
                from: "Guest Communications <onboarding@resend.dev>",
                to: [reservation.guest_email],
                subject: subject,
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    ${htmlContent}
                  </div>
                `,
              });

              console.log(`Email sent to ${reservation.guest_email}:`, emailResult);
              sent = true;
            } catch (emailError) {
              console.error(`Email send error:`, emailError);
              errorMessage = `Email failed: ${emailError.message}`;
            }
          } else {
            console.log(`[DRY RUN] Would send email to ${reservation.guest_email}`);
            console.log(`Subject: ${subject}`);
            console.log(`Content: ${content}`);
            sent = true; // Mark as sent in dry run mode
          }
        }

// Send SMS via OpenPhone
if ((deliveryChannel === "sms" || deliveryChannel === "both") && reservation.guest_phone) {
  const openPhoneApiKey = Deno.env.get("OPENPHONE_API_KEY");
  if (openPhoneApiKey) {
    try {
      // Format phone number (ensure it has country code)
      let phoneNumber = reservation.guest_phone.replace(/\D/g, "");
      if (phoneNumber.length === 10) {
        phoneNumber = "1" + phoneNumber; // Add US country code
      }
      if (!phoneNumber.startsWith("+")) {
        phoneNumber = "+" + phoneNumber;
      }

      const smsResponse = await fetch("https://api.openphone.com/v1/messages", {
        method: "POST",
        headers: {
          "Authorization": openPhoneApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: content.substring(0, 1600), // OpenPhone SMS limit
          to: [phoneNumber],
        }),
      });

      if (smsResponse.ok) {
        console.log(`SMS sent to ${reservation.guest_phone}`);
        sent = true;
      } else {
        const smsError = await smsResponse.text();
        console.error(`SMS send error:`, smsError);
        if (!sent) {
          errorMessage = `SMS failed: ${smsError}`;
        }
      }
    } catch (smsError) {
      console.error(`SMS send error:`, smsError);
      if (!sent) {
        errorMessage = `SMS failed: ${smsError.message}`;
      }
    }
  } else {
    console.log(`[SMS DRY RUN] Would send to ${reservation.guest_phone}: ${content.substring(0, 160)}`);
    if (!sent) {
      sent = true; // Mark as sent in dry run mode
    }
  }
}

        // Update message status
        await supabase
          .from("scheduled_messages")
          .update({
            status: sent ? "sent" : "failed",
            sent_at: sent ? new Date().toISOString() : null,
            error_message: errorMessage || null,
          })
          .eq("id", message.id);

        if (sent) {
          results.sent++;
          console.log(`✓ Message ${message.id} sent successfully`);
        } else {
          results.failed++;
          results.errors.push(errorMessage);
          console.log(`✗ Message ${message.id} failed: ${errorMessage}`);
        }

      } catch (messageError) {
        console.error(`Error processing message ${message.id}:`, messageError);
        
        await supabase
          .from("scheduled_messages")
          .update({
            status: "failed",
            error_message: messageError.message,
          })
          .eq("id", message.id);
        
        results.failed++;
        results.errors.push(messageError.message);
      }
    }

    console.log(`Processing complete. Sent: ${results.sent}, Failed: ${results.failed}`);

    return new Response(
      JSON.stringify({
        message: `Processed ${pendingMessages.length} messages`,
        ...results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in process-scheduled-messages:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
