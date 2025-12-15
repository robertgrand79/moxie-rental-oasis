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

    if (!matchingReservation) {
      console.log("[QUO Webhook] No matching reservation found for phone:", senderPhone);
      // Store as orphan message or log - for now just acknowledge
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Message received but no matching reservation found",
          phone: senderPhone 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[QUO Webhook] Found matching reservation:", matchingReservation.id);

    // Get or create inbox thread for this guest
    const { data: threadId, error: threadError } = await supabase
      .rpc('get_or_create_inbox_thread', {
        p_organization_id: orgId,
        p_guest_email: matchingReservation.guest_email,
        p_guest_name: matchingReservation.guest_name,
        p_guest_phone: senderPhone,
      });

    if (threadError) {
      console.error("[QUO Webhook] Error getting/creating thread:", threadError);
    } else {
      console.log("[QUO Webhook] Thread ID:", threadId);
    }

    // Store inbound SMS in guest_communications
    const { data: communication, error: insertError } = await supabase
      .from("guest_communications")
      .insert({
        reservation_id: matchingReservation.id,
        thread_id: threadId || null,
        message_type: "sms",
        subject: `SMS from ${matchingReservation.guest_name || senderPhone}`,
        message_content: messageBody,
        direction: "inbound",
        sender_email: senderPhone, // Using sender_email field for phone since there's no sender_phone column
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

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Inbound SMS stored successfully",
        communicationId: communication.id,
        reservationId: matchingReservation.id
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
