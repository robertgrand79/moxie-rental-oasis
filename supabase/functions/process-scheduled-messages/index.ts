import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";
import { generateBookingConfirmationEmail, generateGenericEmail } from "./emailTemplates.ts";
import { 
  generateCheckInReminderEmail, 
  generateCheckOutReminderEmail, 
  generateReviewRequestEmail,
  generateCheckInInstructionsEmail 
} from "./guestEmailTemplates.ts";
import { logEmailFailure, EMAIL_TYPES } from "../_shared/emailFailureHandler.ts";

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
  // Clean up any remaining unreplaced variables
  processed = processed.replace(/\{\{[a-zA-Z_]+\}\}/g, "");
  return processed;
}

// Generate address-based slug for guidebook URL (mirrors src/utils/addressSlug.ts)
function generateAddressSlug(location: string): string {
  return location
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Map category to fallback template generator
function getFallbackEmailHtml(category: string, variables: Record<string, string>): string | null {
  switch (category) {
    case 'checkin_reminder':
      return generateCheckInReminderEmail(variables);
    case 'checkin_instructions':
      return generateCheckInInstructionsEmail(variables);
    case 'checkout_reminder':
      return generateCheckOutReminderEmail(variables);
    case 'review_request':
      return generateReviewRequestEmail(variables);
    default:
      return null;
  }
}

// Helper function to get API keys and settings for an organization
async function getOrgSettings(supabase: any, organizationId: string): Promise<{ 
  resendApiKey: string | null; 
  openPhoneApiKey: string | null;
  siteName: string;
  contactEmail: string;
}> {
  if (!organizationId) {
    return { resendApiKey: null, openPhoneApiKey: null, siteName: '', contactEmail: '' };
  }

  // Get organization API keys
  const { data: org } = await supabase
    .from('organizations')
    .select('resend_api_key, openphone_api_key, name, inbound_email_prefix')
    .eq('id', organizationId)
    .single();

  // Get site settings for company name/email
  const { data: settings } = await supabase
    .from('site_settings')
    .select('key, value')
    .eq('organization_id', organizationId)
    .in('key', ['siteName', 'contactEmail']);

  const settingsMap: Record<string, string> = {};
  settings?.forEach((s: { key: string; value: string }) => {
    settingsMap[s.key] = s.value;
  });

  return {
    resendApiKey: org?.resend_api_key || null,
    openPhoneApiKey: org?.openphone_api_key || null,
    siteName: settingsMap.siteName || org?.name || '',
    contactEmail: settingsMap.contactEmail || '',
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("Processing scheduled messages...");

    // Fetch email settings from site_settings (global fallback)
    const { data: emailSettings } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["emailFromAddress", "emailFromName", "emailReplyTo"]);

    const globalSettingsMap: Record<string, string> = {};
    emailSettings?.forEach((s: { key: string; value: string }) => {
      globalSettingsMap[s.key] = s.value;
    });

    const globalFromEmail = globalSettingsMap.emailFromAddress || "onboarding@resend.dev";
    const globalFromName = globalSettingsMap.emailFromName || "Vacation Rentals";
    const globalReplyTo = globalSettingsMap.emailReplyTo || globalFromEmail;

    console.log(`Global email config - From: ${globalFromName} <${globalFromEmail}>`);

    // Get all pending messages that are due
    const now = new Date().toISOString();
    const { data: pendingMessages, error: fetchError } = await supabase
      .from("scheduled_messages")
      .select(`
        *,
        message_templates(name, subject, content, category),
        property_reservations(
          id,
          guest_name,
          guest_email,
          guest_phone,
          check_in_date,
          check_out_date,
          guest_count,
          total_amount,
          property_id,
          properties(title, location, organization_id, organizations(slug, custom_domain))
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

    // Cache for org settings to avoid repeated lookups
    const orgSettingsCache: Map<string, { resendApiKey: string | null; openPhoneApiKey: string | null; siteName: string; contactEmail: string }> = new Map();

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

        // Get organization-level settings (with caching)
        const organizationId = reservation.properties?.organization_id;
        let orgSettings = orgSettingsCache.get(organizationId);
        if (!orgSettings && organizationId) {
          orgSettings = await getOrgSettings(supabase, organizationId);
          orgSettingsCache.set(organizationId, orgSettings);
        }

        // Determine which API keys to use (org-level or global fallback)
        const resendApiKey = orgSettings?.resendApiKey || Deno.env.get("RESEND_API_KEY");
        const openPhoneApiKey = orgSettings?.openPhoneApiKey || Deno.env.get("OPENPHONE_API_KEY");
        
        // Use org-specific sender info or fall back to global
        const fromName = orgSettings?.siteName || globalFromName;
        const fromEmail = globalFromEmail; // Always use verified sender
        const replyTo = orgSettings?.contactEmail || globalReplyTo;
        
        const resend = resendApiKey ? new Resend(resendApiKey) : null;

        // Calculate nights count
        const checkIn = new Date(reservation.check_in_date);
        const checkOut = new Date(reservation.check_out_date);
        const nightsCount = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

        // Format total amount
        const totalAmount = reservation.total_amount 
          ? parseFloat(reservation.total_amount).toFixed(2) 
          : "0.00";

        // Generate confirmation code from reservation ID
        const confirmationCode = reservation.id?.substring(0, 8).toUpperCase() || "N/A";

        // Build template variables
        const variables: Record<string, string> = {
          guest_name: reservation.guest_name || "Guest",
          property_name: reservation.properties?.title || "Property",
          property_address: reservation.properties?.location || "",
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
          checkin_date: new Date(reservation.check_in_date).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          checkout_date: new Date(reservation.check_out_date).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          check_in_time: "4:00 PM",
          check_out_time: "11:00 AM",
          nights_count: nightsCount.toString(),
          guest_count: reservation.guest_count?.toString() || "1",
          total_amount: totalAmount,
          confirmation_code: confirmationCode,
          wifi_network: "",
          wifi_password: "",
          door_code: "",
          guidebook_link: (() => {
            // Build guidebook URL using org custom domain or slug-based URL
            const org = reservation.properties?.organizations;
            const propertyLocation = reservation.properties?.location;
            const propertySlug = propertyLocation ? generateAddressSlug(propertyLocation) : reservation.property_id;
            
            if (org?.custom_domain) {
              return `https://${org.custom_domain}/guest/guidebook/${reservation.property_id}`;
            } else if (org?.slug) {
              const siteUrl = Deno.env.get("SITE_URL") || `https://${org.slug}.lovable.app`;
              return `${siteUrl}/guest/guidebook/${reservation.property_id}`;
            }
            return `${Deno.env.get("SITE_URL") || ""}/guest/guidebook/${reservation.property_id}`;
          })(),
          property_slug: reservation.properties?.location ? generateAddressSlug(reservation.properties.location) : "",
          // Company info for email templates
          company_name: orgSettings?.siteName || fromName,
          company_email: orgSettings?.contactEmail || replyTo,
        };

        // Process subject and content
        const subject = processTemplate(template.subject, variables);
        const content = processTemplate(template.content, variables);

        const deliveryChannel = rule?.delivery_channel || "email";
        let sent = false;
        let errorMessage = "";

        // Get or create inbox thread for this guest
        let threadId = null;
        if (organizationId) {
          const { data: tid, error: threadError } = await supabase
            .rpc('get_or_create_inbox_thread', {
              p_organization_id: organizationId,
              p_guest_email: reservation.guest_email,
              p_guest_name: reservation.guest_name,
              p_guest_phone: reservation.guest_phone,
            });
          
          if (threadError) {
            console.error("Error getting/creating thread:", threadError);
          } else {
            threadId = tid;
          }
        }

        // Send email
        if ((deliveryChannel === "email" || deliveryChannel === "both") && reservation.guest_email) {
          if (resend) {
            try {
              const isBookingConfirmation = template.category === "booking_confirmation" || 
                template.name?.toLowerCase().includes("booking confirmation") ||
                template.name?.toLowerCase().includes("reservation confirm");
              
              // Check if we have a specialized template for this category
              const fallbackHtml = getFallbackEmailHtml(template.category, variables);
              
              let htmlContent: string;
              if (isBookingConfirmation) {
                htmlContent = generateBookingConfirmationEmail(variables);
              } else if (fallbackHtml) {
                // Use the specialized template for this category
                htmlContent = fallbackHtml;
                console.log(`Using specialized ${template.category} email template`);
              } else {
                // Generic template with user content from database
                htmlContent = generateGenericEmail(subject, content, variables);
              }
              
              const emailResult = await resend.emails.send({
                from: `${fromName} <${fromEmail}>`,
                to: [reservation.guest_email],
                replyTo: replyTo,
                subject: subject,
                html: htmlContent,
              });

              console.log(`Email sent to ${reservation.guest_email}:`, emailResult);
              sent = true;

              // Store in guest_communications
              await supabase
                .from("guest_communications")
                .insert({
                  reservation_id: reservation.id,
                  thread_id: threadId,
                  message_type: "email",
                  direction: "outbound",
                  subject: subject,
                  message_content: content,
                  sender_email: fromEmail,
                  delivery_status: "sent",
                  sent_at: new Date().toISOString(),
                  external_message_id: emailResult?.data?.id || null,
                });
            } catch (emailError) {
              console.error(`Email send error:`, emailError);
              errorMessage = `Email failed: ${emailError.message}`;
            }
          } else {
            console.log(`[DRY RUN] Would send email to ${reservation.guest_email}`);
            console.log(`Subject: ${subject}`);
            sent = true;
          }
        }

        // Send SMS via OpenPhone
        if ((deliveryChannel === "sms" || deliveryChannel === "both") && reservation.guest_phone) {
          if (openPhoneApiKey) {
            try {
              let phoneNumber = reservation.guest_phone.replace(/\D/g, "");
              if (phoneNumber.length === 10) {
                phoneNumber = "1" + phoneNumber;
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
                  content: content.substring(0, 1600),
                  to: [phoneNumber],
                }),
              });

              if (smsResponse.ok) {
                console.log(`SMS sent to ${reservation.guest_phone}`);
                sent = true;

                // Store in guest_communications
                const smsResult = await smsResponse.json();
                await supabase
                  .from("guest_communications")
                  .insert({
                    reservation_id: reservation.id,
                    thread_id: threadId,
                    message_type: "sms",
                    direction: "outbound",
                    subject: `SMS to ${reservation.guest_name || reservation.guest_phone}`,
                    message_content: content.substring(0, 1600),
                    sender_email: null,
                    delivery_status: "sent",
                    sent_at: new Date().toISOString(),
                    external_message_id: smsResult?.id || null,
                  });
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
            console.log(`[SMS DRY RUN] Would send to ${reservation.guest_phone}`);
            if (!sent) {
              sent = true;
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
