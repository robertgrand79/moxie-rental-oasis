import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    console.log("[QUO Webhook] Inbound SMS from:", senderPhone);
    console.log("[QUO Webhook] Message body:", messageBody);

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
      })
      .select()
      .single();

    if (insertError) {
      console.error("[QUO Webhook] Error inserting communication:", insertError);
      throw insertError;
    }

    console.log("[QUO Webhook] Stored inbound SMS:", communication.id);

    // Update thread with latest message info
    await supabase
      .from("guest_inbox_threads")
      .update({
        last_message_at: receivedAt,
        last_message_preview: messageBody.substring(0, 100),
        status: 'awaiting_reply',
        is_read: false,
        snoozed_until: null,
      })
      .eq("id", threadId);

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
