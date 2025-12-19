import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createAdminNotification, NOTIFICATION_TYPES, NOTIFICATION_CATEGORIES } from '../_shared/notifications.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OpenPhoneWebhookEvent {
  type: string;
  data: {
    object: {
      id: string;
      from: string;
      to: string;
      body: string;
      direction: string;
      createdAt: string;
      phoneNumberId: string;
    };
  };
}

const handler = async (req: Request): Promise<Response> => {
  console.log("[OpenPhone Webhook] Received request:", req.method);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get organization ID from query params
    const url = new URL(req.url);
    const orgId = url.searchParams.get("org");

    if (!orgId) {
      console.error("[QUO Webhook] Missing org parameter");
      return new Response(
        JSON.stringify({ error: "Missing org parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[QUO Webhook] Processing for organization:", orgId);

    // Parse webhook payload
    const payload: OpenPhoneWebhookEvent = await req.json();
    console.log("[QUO Webhook] Event type:", payload.type);
    console.log("[QUO Webhook] Payload:", JSON.stringify(payload, null, 2));

    // Only process inbound messages
    if (payload.type !== "message.received") {
      console.log("[QUO Webhook] Ignoring event type:", payload.type);
      return new Response(
        JSON.stringify({ success: true, message: "Event type ignored" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const message = payload.data.object;
    const senderPhone = message.from;
    const messageBody = message.body;
    const receivedAt = message.createdAt;
    const receivingPhoneId = message.phoneNumberId;

    console.log("[QUO Webhook] Inbound SMS from:", senderPhone);
    console.log("[QUO Webhook] Receiving phone ID:", receivingPhoneId);
    console.log("[QUO Webhook] Message body:", messageBody);

    // Check if this is a contractor acknowledgment reply (YES, Y, CONFIRM, etc.)
    const normalizedBody = messageBody.trim().toUpperCase();
    const isAcknowledgment = ['YES', 'Y', 'CONFIRM', 'OK', 'ACKNOWLEDGED', 'ACK'].includes(normalizedBody);
    
    if (isAcknowledgment) {
      console.log("[QUO Webhook] Detected contractor acknowledgment reply");
      
      // Normalize phone for matching
      const normalizePhone = (phone: string) => {
        return phone.replace(/[^\d+]/g, "").replace(/^\+1/, "").replace(/^1/, "");
      };
      const normalizedSenderPhone = normalizePhone(senderPhone);
      
      // Find contractor by phone number within this organization
      const { data: contractors, error: contractorError } = await supabase
        .from("contractors")
        .select("id, name, phone, organization_id")
        .eq("organization_id", orgId)
        .eq("is_active", true);
      
      if (contractorError) {
        console.error("[QUO Webhook] Error fetching contractors:", contractorError);
      } else {
        // Find matching contractor by phone
        const matchingContractor = contractors?.find(c => {
          if (!c.phone) return false;
          return normalizePhone(c.phone) === normalizedSenderPhone;
        });
        
        if (matchingContractor) {
          console.log("[QUO Webhook] Found contractor:", matchingContractor.name, matchingContractor.id);
          
          // Find pending work orders for this contractor that haven't been acknowledged
          const { data: pendingWorkOrders, error: woError } = await supabase
            .from("work_orders")
            .select("id, work_order_number, title, status, acknowledged_at")
            .eq("contractor_id", matchingContractor.id)
            .is("acknowledged_at", null)
            .in("status", ["sent", "pending"]);
          
          if (woError) {
            console.error("[QUO Webhook] Error fetching work orders:", woError);
          } else if (pendingWorkOrders && pendingWorkOrders.length > 0) {
            console.log("[QUO Webhook] Found", pendingWorkOrders.length, "pending work orders to acknowledge");
            
            // Acknowledge all pending work orders
            const workOrderIds = pendingWorkOrders.map(wo => wo.id);
            const { error: updateError } = await supabase
              .from("work_orders")
              .update({ 
                acknowledged_at: new Date().toISOString(),
                status: 'acknowledged'
              })
              .in("id", workOrderIds);
            
            if (updateError) {
              console.error("[QUO Webhook] Error acknowledging work orders:", updateError);
            } else {
              console.log("[QUO Webhook] Successfully acknowledged", workOrderIds.length, "work orders via SMS");
              
              // Send confirmation SMS back to contractor
              const workOrderNumbers = pendingWorkOrders.map(wo => wo.work_order_number).join(", ");
              const confirmationMessage = `✅ Acknowledged! Work order${pendingWorkOrders.length > 1 ? 's' : ''} ${workOrderNumbers} confirmed. View all your work orders at: https://moxievacationrentals.com/contractor/portal`;
              
              try {
                await fetch(`${supabaseUrl}/functions/v1/send-sms`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${supabaseKey}`,
                  },
                  body: JSON.stringify({
                    to: senderPhone,
                    message: confirmationMessage,
                    organizationId: orgId,
                  }),
                });
                console.log("[QUO Webhook] Sent acknowledgment confirmation SMS");
              } catch (smsErr) {
                console.error("[QUO Webhook] Failed to send confirmation SMS:", smsErr);
              }
              
              // Create admin notification
              await createAdminNotification(supabase, {
                organizationId: orgId,
                notificationType: NOTIFICATION_TYPES.WORK_ORDER,
                category: NOTIFICATION_CATEGORIES.MAINTENANCE,
                title: `Work Order${pendingWorkOrders.length > 1 ? 's' : ''} Acknowledged via SMS`,
                message: `${matchingContractor.name} acknowledged ${pendingWorkOrders.length} work order${pendingWorkOrders.length > 1 ? 's' : ''} (${workOrderNumbers}) via SMS reply.`,
                actionUrl: `/admin/work-orders`,
                metadata: {
                  contractor_id: matchingContractor.id,
                  contractor_name: matchingContractor.name,
                  work_order_ids: workOrderIds,
                  acknowledged_via: 'sms',
                },
                priority: 'normal',
              });
            }
            
            // Return early - this was a contractor acknowledgment, not a guest message
            return new Response(
              JSON.stringify({ 
                success: true, 
                message: "Contractor acknowledgment processed",
                acknowledgedCount: pendingWorkOrders.length,
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          } else {
            console.log("[QUO Webhook] No pending work orders found for contractor");
          }
        } else {
          console.log("[QUO Webhook] No contractor found with phone:", normalizedSenderPhone);
        }
      }
    }

    // Fetch the organization's configured phone number to filter messages
    const { data: orgData, error: orgError } = await supabase
      .from("organizations")
      .select("openphone_phone_number")
      .eq("id", orgId)
      .single();

    if (orgError) {
      console.error("[QUO Webhook] Error fetching org phone number:", orgError);
      throw orgError;
    }

    // Only process messages for the organization's configured phone number
    if (orgData?.openphone_phone_number && receivingPhoneId !== orgData.openphone_phone_number) {
      console.log("[QUO Webhook] Message for different phone number - ignoring");
      console.log("[QUO Webhook] Received on:", receivingPhoneId);
      console.log("[QUO Webhook] Org configured for:", orgData.openphone_phone_number);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Message ignored - different phone number" 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[QUO Webhook] Phone number matches org config, processing message");

    // Get organization's properties
    const { data: properties, error: propsError } = await supabase
      .from("properties")
      .select("id")
      .eq("organization_id", orgId);

    if (propsError) {
      console.error("[QUO Webhook] Error fetching properties:", propsError);
      throw propsError;
    }

    const propertyIds = properties?.map(p => p.id) || [];
    console.log("[QUO Webhook] Organization property IDs:", propertyIds);

    // Normalize phone number for matching (remove non-digits except leading +)
    const normalizePhone = (phone: string) => {
      return phone.replace(/[^\d+]/g, "").replace(/^\+1/, "").replace(/^1/, "");
    };
    const normalizedSenderPhone = normalizePhone(senderPhone);

    // Find reservation by guest phone number within organization's properties
    const { data: reservations, error: resError } = await supabase
      .from("property_reservations")
      .select("id, guest_name, guest_email, guest_phone, property_id")
      .in("property_id", propertyIds)
      .order("created_at", { ascending: false });

    if (resError) {
      console.error("[QUO Webhook] Error fetching reservations:", resError);
      throw resError;
    }

    // Find matching reservation by phone
    const matchingReservation = reservations?.find(r => {
      if (!r.guest_phone) return false;
      const normalizedGuestPhone = normalizePhone(r.guest_phone);
      return normalizedGuestPhone === normalizedSenderPhone;
    });

    let threadId: string | null = null;
    let guestName: string | null = null;
    let guestEmail: string | null = null;
    let reservationId: string | null = null;

    if (matchingReservation) {
      console.log("[QUO Webhook] Found matching reservation:", matchingReservation.id);
      reservationId = matchingReservation.id;
      guestName = matchingReservation.guest_name;
      guestEmail = matchingReservation.guest_email;

      // Get or create inbox thread for this guest
      const { data: tid, error: threadError } = await supabase
        .rpc('get_or_create_inbox_thread', {
          p_organization_id: orgId,
          p_guest_email: guestEmail,
          p_guest_name: guestName,
          p_guest_phone: senderPhone,
        });

      if (threadError) {
        console.error("[QUO Webhook] Error getting/creating thread:", threadError);
      } else {
        threadId = tid;
        console.log("[QUO Webhook] Thread ID:", threadId);
      }
    } else {
      // No reservation found - look for existing thread by phone number
      console.log("[QUO Webhook] No reservation, checking for existing thread by phone:", normalizedSenderPhone);
      
      const { data: existingThread, error: threadLookupError } = await supabase
        .from("guest_inbox_threads")
        .select("id, guest_name, guest_email")
        .eq("organization_id", orgId)
        .or(`guest_phone.ilike.%${normalizedSenderPhone}%,guest_identifier.ilike.%${normalizedSenderPhone}%`)
        .maybeSingle();

      if (threadLookupError) {
        console.error("[QUO Webhook] Error looking up thread:", threadLookupError);
      }

      if (existingThread) {
        console.log("[QUO Webhook] Found existing thread by phone:", existingThread.id);
        threadId = existingThread.id;
        guestName = existingThread.guest_name;
        guestEmail = existingThread.guest_email;
      } else {
        // Create a new thread for this unknown sender
        console.log("[QUO Webhook] Creating new thread for unknown sender");
        const { data: newThreadId, error: createThreadError } = await supabase
          .rpc('get_or_create_inbox_thread', {
            p_organization_id: orgId,
            p_guest_email: null,
            p_guest_name: `Unknown (${senderPhone})`,
            p_guest_phone: senderPhone,
          });

        if (createThreadError) {
          console.error("[QUO Webhook] Error creating thread:", createThreadError);
        } else {
          threadId = newThreadId;
          guestName = `Unknown (${senderPhone})`;
          console.log("[QUO Webhook] Created new thread:", threadId);
        }
      }
    }

    // Detect language of incoming message using AI
    let detectedLanguage: string | null = null;
    if (messageBody && messageBody.length > 10) {
      try {
        const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
        if (LOVABLE_API_KEY) {
          const langResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [
                { 
                  role: "system", 
                  content: 'Detect the language of this text. Return ONLY the ISO 639-1 two-letter code (e.g., "en", "es", "fr", "de", "zh", "ja"). Nothing else.' 
                },
                { role: "user", content: messageBody }
              ],
              max_tokens: 10,
            }),
          });

          if (langResponse.ok) {
            const langData = await langResponse.json();
            const langCode = langData.choices?.[0]?.message?.content?.trim().toLowerCase();
            if (langCode && langCode.length === 2) {
              detectedLanguage = langCode;
              console.log("[QUO Webhook] Detected language:", detectedLanguage);
            }
          }
        }
      } catch (langError) {
        console.error("[QUO Webhook] Language detection error:", langError);
      }
    }

    // Store inbound SMS in guest_communications (reservation_id can be null)
    if (!threadId) {
      console.error("[QUO Webhook] No thread available, cannot store message");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Could not create or find thread for message"
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: communication, error: insertError } = await supabase
      .from("guest_communications")
      .insert({
        reservation_id: reservationId, // Can be null
        thread_id: threadId,
        message_type: "sms",
        subject: `SMS from ${guestName || senderPhone}`,
        message_content: messageBody,
        direction: "inbound",
        sender_email: senderPhone,
        delivery_status: "delivered",
        is_read: false,
        sent_at: receivedAt,
        detected_language: detectedLanguage,
      })
      .select()
      .single();

    if (insertError) {
      console.error("[QUO Webhook] Error inserting communication:", insertError);
      throw insertError;
    }

    console.log("[QUO Webhook] Stored inbound SMS:", communication.id);

    // Update thread with latest message info and detected language
    const threadUpdate: any = {
      last_message_at: receivedAt,
      last_message_preview: messageBody.substring(0, 100),
      status: 'awaiting_reply',
      is_read: false,
      snoozed_until: null,
    };
    
    // Only update detected_language if we detected a non-English language
    if (detectedLanguage && detectedLanguage !== 'en') {
      threadUpdate.detected_language = detectedLanguage;
    }

    await supabase
      .from("guest_inbox_threads")
      .update(threadUpdate)
      .eq("id", threadId);

    // Create notification for inbound guest message
    await createAdminNotification(supabase, {
      organizationId: orgId,
      notificationType: NOTIFICATION_TYPES.GUEST_MESSAGE,
      category: NOTIFICATION_CATEGORIES.COMMUNICATIONS,
      title: `New SMS from ${guestName || senderPhone}`,
      message: messageBody.substring(0, 200) + (messageBody.length > 200 ? '...' : ''),
      actionUrl: `/admin/host/inbox/${threadId}`,
      metadata: {
        thread_id: threadId,
        reservation_id: reservationId,
        sender_phone: senderPhone,
        message_type: 'sms',
      },
      priority: 'normal',
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Inbound SMS stored successfully",
        communicationId: communication.id,
        threadId: threadId,
        reservationId: reservationId
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[QUO Webhook] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

serve(handler);
