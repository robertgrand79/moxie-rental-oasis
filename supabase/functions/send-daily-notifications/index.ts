import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createAdminNotification, NOTIFICATION_TYPES, NOTIFICATION_CATEGORIES } from "../_shared/notifications.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Edge function to generate check-in/check-out today notifications
 * Should be called daily at 6 AM via cron job, before the daily recap email
 */
const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("[Daily Notifications] Starting daily notification generation...");

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    // Get all active organizations
    const { data: organizations, error: orgError } = await supabase
      .from("organizations")
      .select("id, name")
      .eq("is_active", true);

    if (orgError) {
      console.error("[Daily Notifications] Error fetching organizations:", orgError);
      throw orgError;
    }

    console.log(`[Daily Notifications] Found ${organizations?.length || 0} active organizations`);

    const results: { org: string; checkIns: number; checkOuts: number; errors: string[] }[] = [];

    for (const org of organizations || []) {
      const orgResults = { org: org.name, checkIns: 0, checkOuts: 0, errors: [] as string[] };

      try {
        console.log(`[Daily Notifications] Processing organization: ${org.name} (${org.id})`);

        // Get organization properties
        const { data: properties } = await supabase
          .from("properties")
          .select("id, title")
          .eq("organization_id", org.id);

        if (!properties || properties.length === 0) {
          console.log(`[Daily Notifications] No properties found for ${org.name}`);
          continue;
        }

        const propertyIds = properties.map(p => p.id);
        const propertyMap = new Map(properties.map(p => [p.id, p.title]));

        // Get today's check-ins
        const { data: checkIns, error: checkInError } = await supabase
          .from("property_reservations")
          .select("id, guest_name, property_id, check_in_date, guest_count")
          .in("property_id", propertyIds)
          .eq("check_in_date", todayStr)
          .eq("booking_status", "confirmed");

        if (checkInError) {
          orgResults.errors.push(`Check-in query error: ${checkInError.message}`);
        } else if (checkIns && checkIns.length > 0) {
          console.log(`[Daily Notifications] Found ${checkIns.length} check-ins for ${org.name}`);

          for (const reservation of checkIns) {
            const propertyName = propertyMap.get(reservation.property_id) || "Unknown Property";
            
            const result = await createAdminNotification(supabase, {
              organizationId: org.id,
              notificationType: NOTIFICATION_TYPES.CHECK_IN_TODAY,
              category: NOTIFICATION_CATEGORIES.BOOKINGS,
              title: `Check-in Today: ${reservation.guest_name}`,
              message: `${reservation.guest_name} (${reservation.guest_count || 1} guests) is checking in to ${propertyName} today.`,
              actionUrl: `/admin/reservations/${reservation.id}`,
              metadata: {
                reservation_id: reservation.id,
                property_id: reservation.property_id,
                property_name: propertyName,
                guest_name: reservation.guest_name,
                guest_count: reservation.guest_count,
              },
              priority: 'high',
            });

            if (result.success) {
              orgResults.checkIns++;
            } else {
              orgResults.errors.push(`Failed to create check-in notification: ${result.error}`);
            }
          }
        }

        // Get today's check-outs
        const { data: checkOuts, error: checkOutError } = await supabase
          .from("property_reservations")
          .select("id, guest_name, property_id, check_out_date")
          .in("property_id", propertyIds)
          .eq("check_out_date", todayStr)
          .eq("booking_status", "confirmed");

        if (checkOutError) {
          orgResults.errors.push(`Check-out query error: ${checkOutError.message}`);
        } else if (checkOuts && checkOuts.length > 0) {
          console.log(`[Daily Notifications] Found ${checkOuts.length} check-outs for ${org.name}`);

          for (const reservation of checkOuts) {
            const propertyName = propertyMap.get(reservation.property_id) || "Unknown Property";
            
            const result = await createAdminNotification(supabase, {
              organizationId: org.id,
              notificationType: NOTIFICATION_TYPES.CHECK_OUT_TODAY,
              category: NOTIFICATION_CATEGORIES.BOOKINGS,
              title: `Check-out Today: ${reservation.guest_name}`,
              message: `${reservation.guest_name} is checking out of ${propertyName} today.`,
              actionUrl: `/admin/reservations/${reservation.id}`,
              metadata: {
                reservation_id: reservation.id,
                property_id: reservation.property_id,
                property_name: propertyName,
                guest_name: reservation.guest_name,
              },
              priority: 'normal',
            });

            if (result.success) {
              orgResults.checkOuts++;
            } else {
              orgResults.errors.push(`Failed to create check-out notification: ${result.error}`);
            }
          }
        }

        console.log(`[Daily Notifications] Created ${orgResults.checkIns} check-in and ${orgResults.checkOuts} check-out notifications for ${org.name}`);
      } catch (orgError: any) {
        console.error(`[Daily Notifications] Error processing ${org.name}:`, orgError);
        orgResults.errors.push(orgError.message);
      }

      results.push(orgResults);
    }

    const totalCheckIns = results.reduce((sum, r) => sum + r.checkIns, 0);
    const totalCheckOuts = results.reduce((sum, r) => sum + r.checkOuts, 0);

    console.log(`[Daily Notifications] Completed. Created ${totalCheckIns} check-in and ${totalCheckOuts} check-out notifications across ${results.length} organizations`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        summary: {
          totalCheckIns,
          totalCheckOuts,
          organizationsProcessed: results.length,
        },
        results,
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error: any) {
    console.error("[Daily Notifications] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
};

serve(handler);
