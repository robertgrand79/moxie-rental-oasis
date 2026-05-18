import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";
import { decryptApiKey, isEncrypted } from "../_shared/encryption.ts";
import { htmlToText } from "../_shared/htmlToText.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NewsletterRequest {
  subject: string;
  content: string;
  coverImageUrl?: string;
  linkedContent?: any;
  campaignId?: string;
  sendSMS?: boolean;
  testRecipientEmails?: string[];
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("📧 Newsletter send request received");
    console.log("Request method:", req.method);
    console.log("Request headers:", Object.fromEntries(req.headers.entries()));

    // Create admin client for database operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Create regular client for user authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("❌ No authorization header provided");
      throw new Error("No authorization header");
    }

    // Internal-call mode: the process-scheduled-newsletters cron worker invokes
    // this function with the service-role key + body.internalCall=true. There's
    // no user context (the original admin who scheduled the send may not even
    // be logged in), so we skip user/admin checks and use the orgId passed in
    // the body. Verified by comparing the bearer to SUPABASE_SERVICE_ROLE_KEY
    // — anything less would let any caller bypass admin auth.
    const bearer = authHeader.replace("Bearer ", "").trim();
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    let isInternalCall = false;
    let user: { id: string; email?: string } | null = null;

    // Parse body up front so we can read the internalCall flag.
    let requestBody;
    try {
      const bodyText = await req.text();
      console.log("📝 Raw request body:", bodyText?.slice(0, 500));
      if (!bodyText || bodyText.trim() === '') {
        throw new Error("Empty request body received");
      }
      requestBody = JSON.parse(bodyText);
    } catch (parseError) {
      console.error("❌ Failed to parse request body:", parseError);
      throw new Error("Invalid JSON in request body");
    }

    if (requestBody.internalCall === true && bearer === serviceRoleKey && serviceRoleKey) {
      if (!requestBody.organizationId) {
        throw new Error("Internal call missing organizationId");
      }
      isInternalCall = true;
      console.log("🛠 Internal service-role call accepted (cron worker)");
    } else {
      console.log("🔐 Authenticating user...");
      const { data: { user: authUser }, error: authError } = await supabaseClient.auth.getUser(bearer);
      if (authError || !authUser) {
        console.error("❌ Authentication failed:", authError);
        throw new Error("Unauthorized");
      }
      user = authUser;
      console.log("✅ User authenticated:", user.email);

      console.log("🔍 Checking admin permissions...");
      const { data: profile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError) {
        console.error("❌ Error fetching user profile:", profileError);
        throw new Error("Failed to verify admin permissions");
      }

      if (profile?.role !== "admin") {
        console.error("❌ User is not admin. Role:", profile?.role);
        throw new Error("Admin access required");
      }

      console.log("✅ Admin access confirmed");
    }

    const { subject, content, coverImageUrl, linkedContent, campaignId, sendSMS, testRecipientEmails }: NewsletterRequest = requestBody;
    const isTestSend = Array.isArray(testRecipientEmails) && testRecipientEmails.length > 0;

    console.log("📊 Newsletter data validation:");
    console.log("- Subject:", subject ? `"${subject}" (${subject.length} chars)` : "MISSING");
    console.log("- Content:", content ? `${content.length} characters` : "MISSING");
    console.log("- Cover Image:", coverImageUrl || "None");
    console.log("- Linked Content:", linkedContent ? JSON.stringify(linkedContent) : "None");
    console.log("- Campaign ID:", campaignId || "None");
    console.log("- Send SMS:", sendSMS ? "Yes" : "No");
    console.log("- Test send:", isTestSend ? `Yes (${testRecipientEmails!.length} recipients)` : "No");

    if (!subject || !content) {
      console.error("❌ Missing required fields - Subject:", !!subject, "Content:", !!content);
      throw new Error(`Missing required fields: ${!subject ? 'subject ' : ''}${!content ? 'content' : ''}`);
    }

    if (subject.trim() === '' || content.trim() === '') {
      console.error("❌ Empty required fields - Subject empty:", subject.trim() === '', "Content empty:", content.trim() === '');
      throw new Error("Subject and content cannot be empty");
    }

    // Reject inline-base64 images and oversize content. A pasted/dropped screenshot
    // shows up as `data:image/...;base64,...` inline in the HTML; multiplying that
    // body across N subscribers blows past Resend's payload limit and exhausts
    // the edge runtime's memory, so every send fails silently — exactly the case
    // we hit on the May 2026 newsletter (2.6MB body, 0/194 delivered).
    if (/data:image\/[a-z0-9+]+;base64/i.test(content)) {
      throw new Error(
        "Newsletter content contains an inline base64-encoded image. Email providers reject these. " +
        "Upload the image (Insert image URL in the editor toolbar, or use the cover-image picker) and " +
        "reference it by URL instead."
      );
    }
    const CONTENT_BYTE_LIMIT = 500_000;
    if (content.length > CONTENT_BYTE_LIMIT) {
      throw new Error(
        `Newsletter content is ${(content.length / 1024).toFixed(0)} KB, which exceeds the ${CONTENT_BYTE_LIMIT / 1000} KB cap. ` +
        "Trim the body or move large images to hosted URLs."
      );
    }

    // Resolve org context. For internal calls, body.organizationId is the source
    // of truth (the cron worker passes the campaign's stored org_id). For admin
    // calls, look up the logged-in user's org.
    let effectiveOrgId: string;
    if (isInternalCall) {
      effectiveOrgId = requestBody.organizationId;
    } else {
      console.log("🔑 Fetching user's organization...");
      const { data: userProfile, error: profileOrgError } = await supabaseAdmin
        .from("profiles")
        .select("organization_id")
        .eq("id", user!.id)
        .single();

      if (profileOrgError || !userProfile?.organization_id) {
        console.error("❌ Could not determine user's organization:", profileOrgError);
        throw new Error("Could not determine your organization. Please ensure you are associated with an organization.");
      }
      effectiveOrgId = userProfile.organization_id;
    }
    const userProfile = { organization_id: effectiveOrgId };

    let subscribers: { email: string; name: string | null }[];

    if (isTestSend) {
      const invalid = testRecipientEmails!.filter(e => typeof e !== "string" || !e.includes("@"));
      if (invalid.length > 0) {
        throw new Error(`Invalid test recipient email(s): ${invalid.join(", ")}`);
      }
      subscribers = testRecipientEmails!.map(email => ({ email, name: null }));
      console.log(`🧪 Test send: bypassing subscriber lookup, using ${subscribers.length} test recipient(s)`);
    } else {
      console.log("📬 Getting active subscribers...");
      const { data: dbSubscribers, error: subscribersError } = await supabaseAdmin
        .from("newsletter_subscribers")
        .select("email, name")
        .eq("organization_id", userProfile.organization_id)
        .eq("is_active", true);

      if (subscribersError) {
        console.error("❌ Error fetching subscribers:", subscribersError);
        throw subscribersError;
      }

      if (!dbSubscribers || dbSubscribers.length === 0) {
        console.log("⚠️  No active subscribers found");
        return new Response(
          JSON.stringify({ error: "No active subscribers found", success: false }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      subscribers = dbSubscribers;
      console.log(`📬 Found ${subscribers.length} active subscribers`);
    }

    // Filter out emails on the suppression list (hard bounces, complaints, prior
    // unsubscribes — populated by the resend-webhook function). Sending to these
    // addresses damages sender reputation: hard bounces signal a bad list, and
    // complaint-after-resubscribe spikes are how mail providers detect spam.
    // Skipped for test sends because admins explicitly need test delivery even
    // if their own address ended up on the list during prior testing.
    let suppressedCount = 0;
    if (!isTestSend) {
      const { data: suppressionRows } = await supabaseAdmin
        .from("newsletter_suppression")
        .select("email")
        .eq("organization_id", userProfile.organization_id);
      const suppressed = new Set((suppressionRows ?? []).map(r => r.email.toLowerCase()));
      const before = subscribers.length;
      subscribers = subscribers.filter(s => !suppressed.has(s.email.toLowerCase()));
      suppressedCount = before - subscribers.length;
      if (suppressedCount > 0) {
        console.log(`🚫 Filtered ${suppressedCount} suppressed recipient(s) from send list`);
      }
      if (subscribers.length === 0) {
        return new Response(
          JSON.stringify({
            error: `All ${before} subscriber(s) were on the suppression list. Nothing sent.`,
            success: false,
          }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // Fetch all email, contact, and newsletter settings from site_settings for this organization
    console.log("⚙️ Fetching site settings...");
    const { data: siteSettings, error: settingsError } = await supabaseAdmin
      .from("site_settings")
      .select("key, value")
      .eq("organization_id", userProfile.organization_id)
      .in("key", [
        "emailFromAddress", "emailFromName", "emailReplyTo",
        "siteName", "contactEmail", "phone", "address", "socialMedia",
        "newsletter_header_config", "newsletter_footer_config"
      ]);

    if (settingsError) {
      console.error("❌ Error fetching site settings:", settingsError);
    }

    // Convert settings array to object with proper parsing
    const settings = siteSettings?.reduce((acc, setting) => {
      if (setting.key === 'socialMedia' || setting.key === 'newsletter_header_config' || setting.key === 'newsletter_footer_config') {
        try {
          acc[setting.key] = typeof setting.value === 'string' 
            ? JSON.parse(setting.value) 
            : setting.value;
        } catch (parseError) {
          console.warn(`Failed to parse ${setting.key} setting:`, parseError);
          acc[setting.key] = setting.value;
        }
      } else {
        acc[setting.key] = setting.value;
      }
      return acc;
    }, {} as Record<string, any>) || {};

    console.log("📋 Site settings loaded:", Object.keys(settings));

    // Get newsletter branding configurations
    const headerConfig = settings.newsletter_header_config || {
      title: settings.siteName || 'Newsletter',
      subtitle: settings.tagline || '',
      background_gradient: {
        from: 'hsl(220, 8%, 85%)',
        to: 'hsl(220, 3%, 97%)'
      },
      text_color: 'hsl(222.2, 47.4%, 11.2%)',
      logo_url: ''
    };

    const footerConfig = settings.newsletter_footer_config || {
      company_name: settings.siteName || 'Newsletter',
      tagline: settings.tagline || '',
      contact_info: {
        email: settings.contactEmail || '',
        location: settings.address || ''
      },
      links: [
        { text: 'Visit Our Website', url: '#' },
        { text: 'View Properties', url: '#' }
      ],
      legal_links: [
        { text: 'Unsubscribe', url: '#' },
        { text: 'Update Preferences', url: '#' }
      ],
      social_media: {
        facebook: '',
        instagram: '',
        twitter: ''
      }
    };

    // Use configured settings with fallbacks
    const siteName = settings.siteName || "Vacation Rentals";
    const fromEmail = settings.emailFromAddress || settings.contactEmail || "";
    const fromName = settings.emailFromName || siteName;
    const replyTo = settings.emailReplyTo || fromEmail;
    const contactEmail = settings.contactEmail || fromEmail;
    const phone = settings.phone || "";
    const address = settings.address || "";
    const socialMedia = settings.socialMedia || {
      facebook: '',
      instagram: '',
      twitter: '',
      googlePlaces: ''
    };

    console.log(`📤 Email configuration:`);
    console.log(`- From: ${fromName} <${fromEmail}>`);
    console.log(`- Reply-to: ${replyTo}`);
    console.log(`- Contact: ${contactEmail} | ${phone}`);

    if (!fromEmail) {
      throw new Error("emailFromAddress is not configured for this organization. Set it in Settings > Communications before sending.");
    }

    // Save campaign record. If campaignId is provided (scheduled-send path or
    // draft-promote path), UPDATE the existing row in place so we don't end up
    // with a duplicate campaign + its scheduled_at sibling both in the DB.
    // Otherwise INSERT a new row as before.
    console.log("💾 Saving campaign record...");
    const campaignSubject = isTestSend ? `[TEST] ${subject}` : subject;
    let campaign: any;
    let campaignError: any;
    if (campaignId) {
      const updateResult = await supabaseAdmin
        .from("newsletter_campaigns")
        .update({
          subject: campaignSubject,
          content,
          cover_image_url: coverImageUrl,
          linked_content: linkedContent,
          sent_at: new Date().toISOString(),
          recipient_count: subscribers.length,
          // Clear scheduled_at on send so the cron doesn't re-fire if the row
          // somehow gets picked up again before its sent_at write commits.
          scheduled_at: null,
        })
        .eq("id", campaignId)
        .eq("organization_id", effectiveOrgId)
        .select()
        .single();
      campaign = updateResult.data;
      campaignError = updateResult.error;
    } else {
      const insertResult = await supabaseAdmin
        .from("newsletter_campaigns")
        .insert({
          subject: campaignSubject,
          content,
          cover_image_url: coverImageUrl,
          linked_content: linkedContent,
          sent_at: new Date().toISOString(),
          recipient_count: subscribers.length,
          organization_id: effectiveOrgId,
        })
        .select()
        .single();
      campaign = insertResult.data;
      campaignError = insertResult.error;
    }

    if (campaignError) {
      console.error("❌ Failed to save campaign:", campaignError);
      throw campaignError;
    }

    const savedCampaignId = campaign.id;
    console.log("✅ Campaign saved with ID:", savedCampaignId);

    // Generate preheader from content
    const textContent = content.replace(/<[^>]*>/g, '').trim();
    const preheader = textContent.split('\n')[0]?.trim()?.substring(0, 100) + '...' || `${subject} - Your Eugene adventure awaits!`;

    // Function to add tracking to links
    const addClickTracking = async (htmlContent: string, campaignId: string, subscriberEmail: string) => {
      const linkRegex = /<a\s+(?:[^>]*?\s+)?href=(["'])((?:(?!\1)[^\\]|\\.)*)?\1/gi;
      let trackedContent = htmlContent;
      const matches = [...htmlContent.matchAll(linkRegex)];

      for (const match of matches) {
        const originalUrl = match[2];
        if (originalUrl && !originalUrl.startsWith('#') && !originalUrl.includes('unsubscribe')) {
          // Generate tracking ID
          const trackingId = crypto.randomUUID();
          
          // Save click tracking record
          await supabaseAdmin.from("newsletter_click_tracking").insert({
            campaign_id: campaignId,
            subscriber_email: subscriberEmail,
            original_url: originalUrl,
            tracking_id: trackingId,
          });

          // Replace URL with tracking URL
          const trackingUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/track-newsletter-click?t=${trackingId}`;
          trackedContent = trackedContent.replace(match[0], match[0].replace(originalUrl, trackingUrl));
        }
      }

      return trackedContent;
    };

    // Create email template with modern header design and tracking
    const createEmailTemplate = async (campaignId: string, subscriberEmail: string) => {
      const trackedContent = await addClickTracking(content, campaignId, subscriberEmail);
      const trackingPixelUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/track-newsletter-open?c=${campaignId}&e=${encodeURIComponent(subscriberEmail)}`;

      return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
              body { 
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                  line-height: 1.6; 
                  margin: 0; 
                  padding: 0; 
                  background-color: #f8fafc;
              }
              .container { 
                  max-width: 600px; 
                  margin: 0 auto; 
                  background: #ffffff; 
                  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              }
              .header { 
                  background: linear-gradient(135deg, ${headerConfig.background_gradient?.from || 'hsl(220, 8%, 85%)'} 0%, ${headerConfig.background_gradient?.to || 'hsl(220, 3%, 97%)'} 100%);
                  position: relative;
                  overflow: hidden;
                  padding: 40px 30px; 
                  text-align: center; 
              }
              .header::before {
                  content: '';
                  position: absolute;
                  top: 0;
                  left: 0;
                  right: 0;
                  bottom: 0;
                  background: linear-gradient(45deg, transparent 0%, hsl(220, 6%, 88%) 50%, transparent 100%);
                  opacity: 0.3;
              }
              .header-content {
                  position: relative;
                  z-index: 10;
              }
              .header h1 { 
                  margin: 0 0 12px 0; 
                  font-size: 28px; 
                  font-weight: bold; 
                  color: hsl(222.2, 47.4%, 11.2%);
              }
              .header p { 
                  margin: 0; 
                  font-size: 16px; 
                  font-weight: 500;
                  color: hsl(215.4, 16.3%, 46.9%);
              }
              .content { 
                  padding: 30px; 
              }
              .content h2 { 
                  color: #333; 
                  font-size: 24px; 
                  margin-bottom: 16px; 
              }
              .content h3 { 
                  color: #333; 
                  font-size: 20px; 
                  margin-bottom: 12px; 
              }
              .content p { 
                  color: #666; 
                  line-height: 1.6; 
                  margin-bottom: 16px; 
              }
              .content ul, .content ol { 
                  color: #666; 
                  padding-left: 20px; 
                  margin-bottom: 16px; 
              }
              .content li { 
                  margin-bottom: 8px; 
              }
              .content strong { 
                  color: #333; 
              }
              .content a { 
                  color: hsl(222.2, 47.4%, 11.2%); 
                  text-decoration: none; 
              }
              .content a:hover { 
                  text-decoration: underline; 
              }
              .footer { 
                  background: #f8fafc; 
                  padding: 30px; 
                  text-align: center; 
                  border-top: 1px solid #e2e8f0; 
              }
              .footer p { 
                  margin: 0 0 10px 0; 
                  color: #666; 
                  font-size: 14px; 
              }
              .footer a { 
                  color: hsl(222.2, 47.4%, 11.2%); 
                  text-decoration: none; 
                  margin: 0 8px; 
              }
              .social-links {
                  margin: 16px 0;
              }
              .social-links a {
                  display: inline-block;
                  margin: 0 8px;
                  color: hsl(222.2, 47.4%, 11.2%);
                  text-decoration: none;
              }
              @media (max-width: 600px) {
                  .header { padding: 30px 20px; }
                  .header h1 { font-size: 24px; }
                  .content { padding: 20px; }
                  .footer { padding: 20px; }
              }
          </style>
      </head>
      <body>
          <div class="container">
              ${preheader ? `<div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">${preheader}</div>` : ''}
              
              <div class="header">
                  <div class="header-content">
                      ${headerConfig.logo_url ? `<img src="${headerConfig.logo_url}" alt="${headerConfig.title}" style="max-height: 50px; margin-bottom: 16px;" />` : ''}
                      <h1 style="color: ${headerConfig.text_color};">${headerConfig.title}</h1>
                      <p style="color: ${headerConfig.text_color}; opacity: 0.8;">${headerConfig.subtitle}</p>
                  </div>
              </div>
              
              <div class="content">
                  <h2 style="margin-top: 0;">${subject}</h2>
                  <div>${trackedContent}</div>
              </div>
              
              <div class="footer">
                  <p><strong>${footerConfig.company_name}</strong></p>
                  <p>${footerConfig.tagline}</p>
                  <p>${footerConfig.contact_info?.location || address} | ${footerConfig.contact_info?.email || contactEmail}</p>
                  ${phone ? `<p>Phone: ${phone}</p>` : ''}
                  <div class="social-links">
                      ${footerConfig.links?.map(link => `<a href="${link.url}">${link.text}</a>`).join('') || ''}
                      ${footerConfig.social_media?.facebook ? `<a href="${footerConfig.social_media.facebook}">Facebook</a>` : ''}
                      ${footerConfig.social_media?.instagram ? `<a href="${footerConfig.social_media.instagram}">Instagram</a>` : ''}
                      ${footerConfig.social_media?.twitter ? `<a href="${footerConfig.social_media.twitter}">Twitter</a>` : ''}
                  </div>
                  <p style="font-size: 12px;">
                      ${footerConfig.legal_links?.map(link => `<a href="${link.url === '#' ? '{{unsubscribe_url}}' : link.url}">${link.text}</a>`).join(' | ') || '<a href="{{unsubscribe_url}}">Unsubscribe</a>'}
                  </p>
              </div>
              
              <!-- Tracking Pixel -->
              <img src="${trackingPixelUrl}" width="1" height="1" style="display:none;" alt="" />
          </div>
      </body>
      </html>
    `;
    };

    // Fetch organization's Resend API key
    console.log("🔑 Fetching organization Resend API key...");
    const { data: orgData, error: orgError } = await supabaseAdmin
      .from("organizations")
      .select("resend_api_key")
      .eq("id", userProfile.organization_id)
      .single();

    if (orgError) {
      console.error("❌ Error fetching organization:", orgError);
      throw new Error("Failed to fetch organization settings.");
    }

    // Decrypt the organization's Resend API key
    let resendApiKey = orgData?.resend_api_key || "";
    if (resendApiKey && isEncrypted(resendApiKey)) {
      resendApiKey = await decryptApiKey(resendApiKey);
    }

    // Fallback to global secret if org key not configured
    if (!resendApiKey) {
      resendApiKey = Deno.env.get("RESEND_API_KEY") || "";
      if (resendApiKey) {
        console.log("ℹ️ Using global RESEND_API_KEY as fallback");
      }
    } else {
      console.log("✅ Using organization's Resend API key");
    }

    if (!resendApiKey) {
      console.error("❌ Resend API key not configured");
      throw new Error("Resend API key not configured. Please add your Resend API key in Settings > Communications.");
    }

    const resend = new Resend(resendApiKey);
    console.log("🚀 Sending emails via Resend...");

    const emailPromises = subscribers.map(async (subscriber, index) => {
      try {
        console.log(`📧 Sending email ${index + 1}/${subscribers.length} to ${subscriber.email}`);

        const personalizedHtml = await createEmailTemplate(savedCampaignId, subscriber.email);
      // Per-recipient unsubscribe URL, scoped to the org so the unsubscribe
      // function knows which row to update + which suppression row to upsert.
      const unsubscribeUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/unsubscribe-newsletter?email=${encodeURIComponent(subscriber.email)}&org=${userProfile.organization_id}`;
      const finalHtml = personalizedHtml.replace("{{unsubscribe_url}}", unsubscribeUrl);

      // Plain-text alternative body. Required for Gmail's "clipped message"
      // expander to render anything readable, and improves spam-filter scoring
      // (every reputable transactional sender includes one).
      const textBody = htmlToText(finalHtml);

      // Record sent event
      await supabaseAdmin.from("newsletter_analytics").insert({
        campaign_id: savedCampaignId,
        subscriber_email: subscriber.email,
        event_type: "sent",
        event_data: {
          timestamp: new Date().toISOString(),
          subject: subject
        }
      });

      const response = await resend.emails.send({
        from: `${fromName} <${fromEmail}>`,
        to: [subscriber.email],
        subject: subject,
        html: finalHtml,
        text: textBody,
        reply_to: replyTo,
        // RFC 8058 one-click unsubscribe. Gmail (>=2024) and Yahoo flag senders
        // without these headers as spam once volume exceeds 5k/day, and even
        // below that threshold including them visibly improves inbox placement.
        // The Post variant tells mail clients they can POST without confirmation.
        headers: {
          "List-Unsubscribe": `<${unsubscribeUrl}>, <mailto:unsubscribe@${(fromEmail.split('@')[1] || '').toLowerCase()}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
        // Tag every outbound so the resend-webhook function can route delivery
        // events back to the right org + campaign without needing a lookup.
        tags: [
          { name: "organization_id", value: userProfile.organization_id },
          { name: "campaign_id", value: savedCampaignId },
        ],
      });

      if (response.error) {
        const detail = typeof response.error === 'string'
          ? response.error
          : (response.error.message || JSON.stringify(response.error));
        console.error(`❌ Resend rejected ${subscriber.email}:`, detail);
        throw new Error(`Resend: ${detail}`);
      }

      console.log(`✅ Email sent to ${subscriber.email} (${index + 1}/${subscribers.length})`);
      return { email: subscriber.email, success: true };
    } catch (error) {
      console.error(`❌ Failed to send email to ${subscriber.email}:`, error);
      return { email: subscriber.email, success: false, error: error.message };
    }
  });

  console.log("⏳ Waiting for all emails to be sent...");
  const results = await Promise.allSettled(emailPromises);
  
  const successfulSends = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
  const failedSends = results.length - successfulSends;

  console.log(`✅ Newsletter sending complete: ${successfulSends} successful, ${failedSends} failed`);

  // Handle SMS sending if requested
  let smsSentCount = 0;
  let smsFailedCount = 0;
  
  if (sendSMS && !isTestSend) {
    console.log("📱 Starting SMS notifications...");
    
    // Get SMS subscribers for this organization
    const { data: smsSubscribers, error: smsSubError } = await supabaseAdmin
      .from("newsletter_subscribers")
      .select("id, phone, name")
      .eq("organization_id", userProfile.organization_id)
      .eq("is_active", true)
      .eq("sms_opt_in", true)
      .not("phone", "is", null);

    if (smsSubError) {
      console.error("❌ Error fetching SMS subscribers:", smsSubError);
    } else if (smsSubscribers && smsSubscribers.length > 0) {
      console.log(`📱 Found ${smsSubscribers.length} SMS subscribers`);
      
      // Get organization's OpenPhone API key
      const { data: orgSmsData } = await supabaseAdmin
        .from("organizations")
        .select("openphone_api_key, openphone_phone_number, name, slug, custom_domain")
        .eq("id", userProfile.organization_id)
        .single();

      const openPhoneApiKey = orgSmsData?.openphone_api_key || Deno.env.get("OPENPHONE_API_KEY");
      
      if (openPhoneApiKey) {
        // Build the web view URL
        // Pick the most specific host for the web-view link, same order as invitation emails:
        //   1. org.custom_domain  2. {slug}.staymoxie.com  3. SITE_URL secret
        let baseUrl: string;
        if (orgSmsData?.custom_domain) {
          baseUrl = `https://${orgSmsData.custom_domain}`;
        } else if (orgSmsData?.slug) {
          baseUrl = `https://${orgSmsData.slug}.staymoxie.com`;
        } else {
          const siteUrl = Deno.env.get("SITE_URL");
          if (!siteUrl) {
            console.error("❌ SITE_URL is not configured and org has no slug/custom_domain — cannot build SMS newsletter links");
            throw new Error("SITE_URL secret is not configured");
          }
          baseUrl = siteUrl;
        }
        const webViewUrl = `${baseUrl}/newsletter/${savedCampaignId}`;
        const orgName = orgSmsData?.name || siteName;
        
        // Send SMS to each subscriber
        for (const subscriber of smsSubscribers) {
          try {
            const smsMessage = subscriber.name 
              ? `Hi ${subscriber.name}! Check out our latest newsletter from ${orgName}: ${webViewUrl}`
              : `Check out our latest newsletter from ${orgName}: ${webViewUrl}`;

            const smsResponse = await fetch("https://api.openphone.com/v1/messages", {
              method: "POST",
              headers: {
                "Authorization": openPhoneApiKey,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                to: [subscriber.phone],
                content: smsMessage,
              }),
            });

            if (smsResponse.ok) {
              smsSentCount++;
              console.log(`✅ SMS sent to ${subscriber.phone}`);
            } else {
              smsFailedCount++;
              const errorText = await smsResponse.text();
              console.error(`❌ Failed to send SMS to ${subscriber.phone}:`, errorText);
            }

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (smsError: any) {
            smsFailedCount++;
            console.error(`❌ Error sending SMS to ${subscriber.phone}:`, smsError);
          }
        }
        
        console.log(`📱 SMS sending complete: ${smsSentCount} successful, ${smsFailedCount} failed`);
      } else {
        console.log("⚠️ No OpenPhone API key configured, skipping SMS");
      }
    } else {
      console.log("ℹ️ No SMS subscribers found");
    }
  }

  // Update campaign with final statistics
  await supabaseAdmin
    .from("newsletter_campaigns")
    .update({
      sent_count: successfulSends,
      failed_count: failedSends,
      completed_at: new Date().toISOString()
    })
    .eq("id", savedCampaignId);

  // If literally no emails went out, surface that as a failure to the UI.
  // Previously success was hard-coded true, so the "🎉 Sent" toast fired even
  // when 0/N succeeded — which is exactly how the May 2026 newsletter looked
  // sent but never reached Resend.
  const everyoneFailed = subscribers.length > 0 && successfulSends === 0;
  // Try to surface a sample error from a fulfilled-but-failed promise so the
  // user sees the actual Resend rejection reason in the toast.
  let firstError: string | undefined;
  if (everyoneFailed) {
    for (const r of results) {
      if (r.status === 'fulfilled' && !r.value.success && r.value.error) {
        firstError = r.value.error;
        break;
      }
    }
  }

  return new Response(
    JSON.stringify({
      success: !everyoneFailed,
      error: everyoneFailed
        ? `Newsletter failed to send: 0 of ${subscribers.length} recipients delivered.${firstError ? ` First error: ${firstError}` : ''}`
        : undefined,
      message: isTestSend
        ? `Test newsletter sent to ${successfulSends} of ${subscribers.length} test recipient(s)`
        : `Newsletter sent to ${successfulSends} of ${subscribers.length} subscribers${suppressedCount > 0 ? ` (${suppressedCount} suppressed)` : ''}`,
      campaignId: savedCampaignId,
      recipientCount: successfulSends,
      suppressedCount,
      smsSentCount,
      smsFailedCount,
      isTestSend,
      firstError,
      stats: {
        total: subscribers.length,
        successful: successfulSends,
        failed: failedSends,
        suppressed: suppressedCount,
        smsSent: smsSentCount,
        smsFailed: smsFailedCount
      }
    }),
    {
      status: everyoneFailed ? 502 : 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    }
  );

} catch (error: any) {
  console.error("❌ Error in send-newsletter function:", error);
  console.error("❌ Stack trace:", error.stack);
  
  return new Response(
    JSON.stringify({
      error: error.message || "An unexpected error occurred",
      timestamp: new Date().toISOString()
    }),
    {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    }
  );
}

}; // Close the main handler function

serve(handler);
