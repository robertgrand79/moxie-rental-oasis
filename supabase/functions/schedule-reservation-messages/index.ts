import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ScheduleRequest {
  reservation_id: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { reservation_id }: ScheduleRequest = await req.json();
    console.log(`Scheduling messages for reservation: ${reservation_id}`);

    // Get reservation details
    const { data: reservation, error: resError } = await supabase
      .from("property_reservations")
      .select("*, properties(id, title)")
      .eq("id", reservation_id)
      .single();

    if (resError || !reservation) {
      console.error("Reservation not found:", resError);
      return new Response(
        JSON.stringify({ error: "Reservation not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Reservation found: ${reservation.guest_name}, property: ${reservation.property_id}`);

    // Get all active messaging rules (global + property-specific)
    const { data: rules, error: rulesError } = await supabase
      .from("messaging_rules")
      .select("*, message_templates(id, name, subject, content)")
      .eq("is_active", true)
      .or(`property_id.is.null,property_id.eq.${reservation.property_id}`);

    if (rulesError) {
      console.error("Error fetching rules:", rulesError);
      throw rulesError;
    }

    console.log(`Found ${rules?.length || 0} active rules`);

    if (!rules || rules.length === 0) {
      return new Response(
        JSON.stringify({ message: "No active rules found", scheduled: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const checkInDate = new Date(reservation.check_in_date);
    const checkOutDate = new Date(reservation.check_out_date);
    const now = new Date();
    const scheduledMessages = [];

    for (const rule of rules) {
      let scheduledFor: Date | null = null;

      // Calculate scheduled time based on trigger type
      switch (rule.trigger_type) {
        case "booking_confirmed":
          // Send immediately (or within a few minutes)
          scheduledFor = new Date(now.getTime() + 2 * 60 * 1000); // 2 minutes from now
          break;

        case "before_checkin":
          scheduledFor = new Date(checkInDate);
          scheduledFor.setHours(scheduledFor.getHours() + rule.trigger_offset_hours);
          break;

        case "day_of_checkin":
          scheduledFor = new Date(checkInDate);
          // Set to trigger_time on check-in day
          if (rule.trigger_time) {
            const [hours, minutes] = rule.trigger_time.split(":");
            scheduledFor.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          }
          break;

        case "after_checkin":
          scheduledFor = new Date(checkInDate);
          scheduledFor.setHours(scheduledFor.getHours() + rule.trigger_offset_hours);
          break;

        case "before_checkout":
          scheduledFor = new Date(checkOutDate);
          scheduledFor.setHours(scheduledFor.getHours() + rule.trigger_offset_hours);
          break;

        case "after_checkout":
          scheduledFor = new Date(checkOutDate);
          scheduledFor.setHours(scheduledFor.getHours() + rule.trigger_offset_hours);
          break;
      }

      // Only schedule if the time is in the future
      if (scheduledFor && scheduledFor > now) {
        const { data: scheduled, error: scheduleError } = await supabase
          .from("scheduled_messages")
          .insert({
            reservation_id: reservation.id,
            rule_id: rule.id,
            template_id: rule.template_id,
            scheduled_for: scheduledFor.toISOString(),
            status: "pending",
          })
          .select()
          .single();

        if (scheduleError) {
          console.error(`Error scheduling message for rule ${rule.name}:`, scheduleError);
        } else {
          console.log(`Scheduled: ${rule.name} for ${scheduledFor.toISOString()}`);
          scheduledMessages.push(scheduled);
        }
      } else {
        console.log(`Skipped rule "${rule.name}" - scheduled time is in the past`);
      }
    }

    console.log(`Successfully scheduled ${scheduledMessages.length} messages`);

    return new Response(
      JSON.stringify({ 
        message: `Scheduled ${scheduledMessages.length} messages`,
        scheduled: scheduledMessages.length,
        messages: scheduledMessages
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in schedule-reservation-messages:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
