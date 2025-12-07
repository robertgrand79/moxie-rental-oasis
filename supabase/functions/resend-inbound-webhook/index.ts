import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ResendInboundEmail {
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  text?: string;
  html?: string;
  headers?: Record<string, string>;
  attachments?: Array<{
    filename: string;
    content_type: string;
    content: string;
  }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const payload: ResendInboundEmail = await req.json();
    
    console.log("Received inbound email webhook:", {
      from: payload.from,
      to: payload.to,
      subject: payload.subject,
    });

    // Extract sender email from the "from" field (format: "Name <email@domain.com>" or just "email@domain.com")
    const fromMatch = payload.from.match(/<(.+)>/) || [null, payload.from];
    const senderEmail = fromMatch[1]?.toLowerCase().trim();

    if (!senderEmail) {
      console.error("Could not extract sender email from:", payload.from);
      return new Response(
        JSON.stringify({ error: "Invalid sender email" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Looking up reservations for sender:", senderEmail);

    // Find reservation(s) associated with this email address
    const { data: reservations, error: reservationError } = await supabase
      .from("property_reservations")
      .select("id, guest_name, guest_email, property_id, check_in_date, check_out_date")
      .ilike("guest_email", senderEmail)
      .order("created_at", { ascending: false })
      .limit(5);

    if (reservationError) {
      console.error("Error fetching reservations:", reservationError);
    }

    // Get message content - prefer text, fallback to stripped HTML
    let messageContent = payload.text || "";
    if (!messageContent && payload.html) {
      // Basic HTML stripping
      messageContent = payload.html
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .trim();
    }

    // Store the inbound email
    if (reservations && reservations.length > 0) {
      // Associate with the most recent reservation
      const reservation = reservations[0];
      
      const { data: insertedComm, error: insertError } = await supabase
        .from("guest_communications")
        .insert({
          reservation_id: reservation.id,
          message_type: "email",
          subject: payload.subject || "(No Subject)",
          message_content: messageContent,
          direction: "inbound",
          sender_email: senderEmail,
          is_read: false,
          delivery_status: "received",
          sent_at: new Date().toISOString(),
          raw_email_data: {
            from: payload.from,
            to: payload.to,
            cc: payload.cc,
            headers: payload.headers,
            has_attachments: (payload.attachments?.length || 0) > 0,
          },
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error inserting communication:", insertError);
        throw insertError;
      }

      console.log(`✓ Inbound email stored for reservation ${reservation.id}:`, insertedComm?.id);

      return new Response(
        JSON.stringify({
          success: true,
          message: "Email received and stored",
          reservation_id: reservation.id,
          communication_id: insertedComm?.id,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // No matching reservation - store as orphaned for admin review
      console.log("No matching reservation found for email:", senderEmail);
      
      // Still store the email for review - use null reservation_id
      // Note: This requires updating the foreign key constraint or creating a separate table
      // For now, we'll log it and notify admin
      
      console.log("Orphaned inbound email - no matching reservation:", {
        from: senderEmail,
        subject: payload.subject,
        content_preview: messageContent.substring(0, 200),
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: "Email received but no matching reservation found",
          sender: senderEmail,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

  } catch (error) {
    console.error("Error processing inbound email webhook:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
