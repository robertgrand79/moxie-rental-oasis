import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RecapData {
  organizationId: string;
  organizationName: string;
  recipients: { email: string; name: string }[];
  yesterday: {
    messagesSent: number;
    newReservations: number;
    completedWorkOrders: number;
  };
  today: {
    checkOuts: { guestName: string; propertyName: string; checkOutDate: string }[];
    checkIns: { guestName: string; propertyName: string; checkInDate: string }[];
    turnovers: { propertyName: string }[];
    workOrdersDue: { title: string; propertyName: string; priority: string }[];
  };
  upcoming: {
    checkIns: { guestName: string; propertyName: string; checkInDate: string }[];
    pendingReservations: { guestName: string; propertyName: string; totalAmount: number }[];
  };
  attention: {
    unreadMessages: number;
    overdueWorkOrders: { title: string; propertyName: string; dueDate: string }[];
  };
  stats: {
    activeReservations: number;
    occupancyRate: number;
  };
  brandColors: {
    primary: string;
    accent: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting daily recap email generation...");

    // Get all active organizations
    const { data: organizations, error: orgError } = await supabase
      .from("organizations")
      .select("id, name, resend_api_key")
      .eq("is_active", true);

    if (orgError) {
      console.error("Error fetching organizations:", orgError);
      throw orgError;
    }

    console.log(`Found ${organizations?.length || 0} active organizations`);

    const results: { org: string; success: boolean; error?: string }[] = [];

    for (const org of organizations || []) {
      try {
        console.log(`Processing organization: ${org.name} (${org.id})`);
        
        // Get organization members with admin/owner roles
        const { data: members } = await supabase
          .from("organization_members")
          .select(`
            user_id,
            role,
            profiles!inner(email, full_name)
          `)
          .eq("organization_id", org.id)
          .in("role", ["admin", "owner"]);

        if (!members || members.length === 0) {
          console.log(`No admin/owner members found for ${org.name}`);
          continue;
        }

        // Filter recipients by their notification preferences (email_digest enabled)
        const recipientsWithPrefs: { email: string; name: string; userId: string }[] = [];
        
        for (const m of members as any[]) {
          // Check if user has email_digest enabled for any notification type
          const { data: prefs } = await supabase
            .from("notification_preferences")
            .select("email_digest")
            .eq("user_id", m.user_id)
            .eq("email_digest", true)
            .limit(1);
          
          // Include user if they have at least one notification type with email_digest enabled
          // or if they have no preferences set (default to included)
          const { count: prefCount } = await supabase
            .from("notification_preferences")
            .select("*", { count: "exact", head: true })
            .eq("user_id", m.user_id);
          
          if (!prefCount || prefCount === 0 || (prefs && prefs.length > 0)) {
            recipientsWithPrefs.push({
              email: m.profiles.email,
              name: m.profiles.full_name || "Team Member",
              userId: m.user_id,
            });
          }
        }

        if (recipientsWithPrefs.length === 0) {
          console.log(`No recipients opted into daily digest for ${org.name}`);
          continue;
        }

        const recipients = recipientsWithPrefs.map(r => ({ email: r.email, name: r.name }));

        // Get organization properties
        const { data: properties } = await supabase
          .from("properties")
          .select("id, name")
          .eq("organization_id", org.id);

        const propertyIds = properties?.map(p => p.id) || [];
        const propertyMap = new Map(properties?.map(p => [p.id, p.name]) || []);

        if (propertyIds.length === 0) {
          console.log(`No properties found for ${org.name}`);
          continue;
        }

        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);

        const todayStr = today.toISOString().split("T")[0];
        const yesterdayStr = yesterday.toISOString().split("T")[0];
        const nextWeekStr = nextWeek.toISOString().split("T")[0];

        // Fetch yesterday's activity
        const { count: messagesSent } = await supabase
          .from("guest_communications")
          .select("*", { count: "exact", head: true })
          .in("reservation_id", 
            await supabase
              .from("property_reservations")
              .select("id")
              .in("property_id", propertyIds)
              .then(r => r.data?.map(d => d.id) || [])
          )
          .eq("direction", "outbound")
          .gte("sent_at", yesterdayStr)
          .lt("sent_at", todayStr);

        const { count: newReservations } = await supabase
          .from("property_reservations")
          .select("*", { count: "exact", head: true })
          .in("property_id", propertyIds)
          .gte("created_at", yesterdayStr)
          .lt("created_at", todayStr);

        const { count: completedWorkOrders } = await supabase
          .from("work_orders")
          .select("*", { count: "exact", head: true })
          .in("property_id", propertyIds)
          .eq("status", "completed")
          .gte("updated_at", yesterdayStr)
          .lt("updated_at", todayStr);

        // Today's check-outs
        const { data: checkOutsData } = await supabase
          .from("property_reservations")
          .select("guest_name, property_id, check_out_date")
          .in("property_id", propertyIds)
          .eq("check_out_date", todayStr)
          .eq("booking_status", "confirmed");

        const checkOuts = (checkOutsData || []).map(r => ({
          guestName: r.guest_name,
          propertyName: propertyMap.get(r.property_id) || "Unknown",
          checkOutDate: r.check_out_date,
        }));

        // Today's check-ins
        const { data: checkInsData } = await supabase
          .from("property_reservations")
          .select("guest_name, property_id, check_in_date")
          .in("property_id", propertyIds)
          .eq("check_in_date", todayStr)
          .eq("booking_status", "confirmed");

        const checkIns = (checkInsData || []).map(r => ({
          guestName: r.guest_name,
          propertyName: propertyMap.get(r.property_id) || "Unknown",
          checkInDate: r.check_in_date,
        }));

        // Turnovers (same property has check-out and check-in today)
        const checkOutProperties = new Set(checkOuts.map(c => c.propertyName));
        const turnovers = checkIns
          .filter(c => checkOutProperties.has(c.propertyName))
          .map(c => ({ propertyName: c.propertyName }));

        // Work orders due today
        const { data: workOrdersDueData } = await supabase
          .from("work_orders")
          .select("title, property_id, priority")
          .in("property_id", propertyIds)
          .eq("scheduled_date", todayStr)
          .neq("status", "completed");

        const workOrdersDue = (workOrdersDueData || []).map(w => ({
          title: w.title,
          propertyName: propertyMap.get(w.property_id) || "Unknown",
          priority: w.priority,
        }));

        // Upcoming check-ins (next 7 days)
        const { data: upcomingCheckInsData } = await supabase
          .from("property_reservations")
          .select("guest_name, property_id, check_in_date")
          .in("property_id", propertyIds)
          .gt("check_in_date", todayStr)
          .lte("check_in_date", nextWeekStr)
          .eq("booking_status", "confirmed")
          .order("check_in_date")
          .limit(10);

        const upcomingCheckIns = (upcomingCheckInsData || []).map(r => ({
          guestName: r.guest_name,
          propertyName: propertyMap.get(r.property_id) || "Unknown",
          checkInDate: r.check_in_date,
        }));

        // Pending reservations
        const { data: pendingReservationsData } = await supabase
          .from("property_reservations")
          .select("guest_name, property_id, total_amount")
          .in("property_id", propertyIds)
          .eq("payment_status", "pending")
          .limit(10);

        const pendingReservations = (pendingReservationsData || []).map(r => ({
          guestName: r.guest_name,
          propertyName: propertyMap.get(r.property_id) || "Unknown",
          totalAmount: r.total_amount,
        }));

        // Unread messages count
        const { count: unreadMessages } = await supabase
          .from("guest_inbox_threads")
          .select("*", { count: "exact", head: true })
          .eq("organization_id", org.id)
          .eq("is_read", false);

        // Overdue work orders
        const { data: overdueWorkOrdersData } = await supabase
          .from("work_orders")
          .select("title, property_id, scheduled_date")
          .in("property_id", propertyIds)
          .lt("scheduled_date", todayStr)
          .neq("status", "completed")
          .limit(10);

        const overdueWorkOrders = (overdueWorkOrdersData || []).map(w => ({
          title: w.title,
          propertyName: propertyMap.get(w.property_id) || "Unknown",
          dueDate: w.scheduled_date,
        }));

        // Active reservations count
        const { count: activeReservations } = await supabase
          .from("property_reservations")
          .select("*", { count: "exact", head: true })
          .in("property_id", propertyIds)
          .lte("check_in_date", todayStr)
          .gte("check_out_date", todayStr)
          .eq("booking_status", "confirmed");

        // Calculate occupancy rate
        const occupiedProperties = new Set(
          (await supabase
            .from("property_reservations")
            .select("property_id")
            .in("property_id", propertyIds)
            .lte("check_in_date", todayStr)
            .gte("check_out_date", todayStr)
            .eq("booking_status", "confirmed")
          ).data?.map(r => r.property_id) || []
        );
        const occupancyRate = propertyIds.length > 0 
          ? Math.round((occupiedProperties.size / propertyIds.length) * 100) 
          : 0;

        // Get brand colors from site settings
        const { data: colorSettings } = await supabase
          .from("site_settings")
          .select("key, value")
          .eq("organization_id", org.id)
          .in("key", ["primaryColor", "accentColor"]);

        const brandColors = {
          primary: colorSettings?.find(s => s.key === "primaryColor")?.value?.replace(/"/g, "") || "#2563eb",
          accent: colorSettings?.find(s => s.key === "accentColor")?.value?.replace(/"/g, "") || "#3b82f6",
        };

        const recapData: RecapData = {
          organizationId: org.id,
          organizationName: org.name,
          recipients,
          yesterday: {
            messagesSent: messagesSent || 0,
            newReservations: newReservations || 0,
            completedWorkOrders: completedWorkOrders || 0,
          },
          today: {
            checkOuts,
            checkIns,
            turnovers,
            workOrdersDue,
          },
          upcoming: {
            checkIns: upcomingCheckIns,
            pendingReservations,
          },
          attention: {
            unreadMessages: unreadMessages || 0,
            overdueWorkOrders,
          },
          stats: {
            activeReservations: activeReservations || 0,
            occupancyRate,
          },
          brandColors,
        };

        // Generate and send email
        const html = generateEmailHtml(recapData);
        
        // Use org-level Resend key or fall back to global
        const resendApiKey = org.resend_api_key || Deno.env.get("RESEND_API_KEY");
        
        if (!resendApiKey) {
          console.log(`No Resend API key configured for ${org.name}`);
          results.push({ org: org.name, success: false, error: "No Resend API key" });
          continue;
        }

        const resend = new Resend(resendApiKey);

        for (const recipient of recipients) {
          try {
            await resend.emails.send({
              from: `${org.name} <notifications@resend.dev>`,
              to: [recipient.email],
              subject: `Daily Recap - ${formatDate(today)}`,
              html,
            });
            console.log(`Email sent to ${recipient.email} for ${org.name}`);
          } catch (emailError) {
            console.error(`Failed to send email to ${recipient.email}:`, emailError);
          }
        }

        results.push({ org: org.name, success: true });
      } catch (orgError) {
        console.error(`Error processing ${org.name}:`, orgError);
        results.push({ org: org.name, success: false, error: String(orgError) });
      }
    }

    console.log("Daily recap completed:", results);

    return new Response(JSON.stringify({ success: true, results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in send-daily-recap:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
};

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function generateEmailHtml(data: RecapData): string {
  const { organizationName, yesterday, today, upcoming, attention, stats, brandColors } = data;
  const todayDate = formatDate(new Date());
  
  const hasYesterdayActivity = yesterday.messagesSent > 0 || yesterday.newReservations > 0 || yesterday.completedWorkOrders > 0;
  const hasTodayItems = today.checkOuts.length > 0 || today.checkIns.length > 0 || today.workOrdersDue.length > 0;
  const hasAttentionItems = attention.unreadMessages > 0 || attention.overdueWorkOrders.length > 0;
  const hasUpcoming = upcoming.checkIns.length > 0 || upcoming.pendingReservations.length > 0;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daily Recap - ${organizationName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5; line-height: 1.6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.accent} 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">Daily Recap</h1>
              <p style="margin: 8px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">${todayDate}</p>
            </td>
          </tr>

          <!-- Quick Stats Bar -->
          <tr>
            <td style="padding: 0;">
              <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #fafafa;">
                <tr>
                  <td style="padding: 20px; text-align: center; border-right: 1px solid #e4e4e7;">
                    <div style="font-size: 32px; font-weight: 700; color: ${brandColors.primary};">${stats.activeReservations}</div>
                    <div style="font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 0.5px;">Active Stays</div>
                  </td>
                  <td style="padding: 20px; text-align: center; border-right: 1px solid #e4e4e7;">
                    <div style="font-size: 32px; font-weight: 700; color: ${brandColors.primary};">${stats.occupancyRate}%</div>
                    <div style="font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 0.5px;">Occupancy</div>
                  </td>
                  <td style="padding: 20px; text-align: center;">
                    <div style="font-size: 32px; font-weight: 700; color: ${hasAttentionItems ? '#dc2626' : '#22c55e'};">${attention.unreadMessages + attention.overdueWorkOrders.length}</div>
                    <div style="font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 0.5px;">Needs Attention</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Attention Items (if any) -->
          ${hasAttentionItems ? `
          <tr>
            <td style="padding: 24px 40px 0;">
              <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px;">
                <h2 style="margin: 0 0 12px; font-size: 16px; font-weight: 600; color: #dc2626;">
                  ⚠️ Needs Attention
                </h2>
                ${attention.unreadMessages > 0 ? `
                <p style="margin: 0 0 8px; color: #7f1d1d; font-size: 14px;">
                  📨 <strong>${attention.unreadMessages}</strong> unread guest message${attention.unreadMessages !== 1 ? 's' : ''}
                </p>
                ` : ''}
                ${attention.overdueWorkOrders.map(wo => `
                <p style="margin: 0 0 8px; color: #7f1d1d; font-size: 14px;">
                  🔧 <strong>${wo.title}</strong> at ${wo.propertyName} (due ${formatShortDate(wo.dueDate)})
                </p>
                `).join('')}
              </div>
            </td>
          </tr>
          ` : ''}

          <!-- Today's Action Items -->
          <tr>
            <td style="padding: 24px 40px;">
              <h2 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #18181b; border-bottom: 2px solid ${brandColors.primary}; padding-bottom: 8px;">
                📅 Today's Schedule
              </h2>
              
              ${!hasTodayItems ? `
              <p style="margin: 0; color: #71717a; font-style: italic;">Nothing scheduled for today. Enjoy your day! ☀️</p>
              ` : ''}

              ${today.checkOuts.length > 0 ? `
              <div style="margin-bottom: 16px;">
                <h3 style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #71717a; text-transform: uppercase; letter-spacing: 0.5px;">
                  🚪 Check-Outs (${today.checkOuts.length})
                </h3>
                ${today.checkOuts.map(co => `
                <div style="background-color: #fef3c7; border-radius: 6px; padding: 12px; margin-bottom: 8px;">
                  <strong style="color: #92400e;">${co.guestName}</strong>
                  <span style="color: #a16207;"> • ${co.propertyName}</span>
                </div>
                `).join('')}
              </div>
              ` : ''}

              ${today.checkIns.length > 0 ? `
              <div style="margin-bottom: 16px;">
                <h3 style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #71717a; text-transform: uppercase; letter-spacing: 0.5px;">
                  🏠 Check-Ins (${today.checkIns.length})
                </h3>
                ${today.checkIns.map(ci => `
                <div style="background-color: #dcfce7; border-radius: 6px; padding: 12px; margin-bottom: 8px;">
                  <strong style="color: #166534;">${ci.guestName}</strong>
                  <span style="color: #15803d;"> • ${ci.propertyName}</span>
                  ${today.turnovers.some(t => t.propertyName === ci.propertyName) ? '<span style="background-color: #fbbf24; color: #78350f; padding: 2px 6px; border-radius: 4px; font-size: 11px; margin-left: 8px;">TURNOVER</span>' : ''}
                </div>
                `).join('')}
              </div>
              ` : ''}

              ${today.workOrdersDue.length > 0 ? `
              <div style="margin-bottom: 16px;">
                <h3 style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #71717a; text-transform: uppercase; letter-spacing: 0.5px;">
                  🔧 Work Orders Due (${today.workOrdersDue.length})
                </h3>
                ${today.workOrdersDue.map(wo => `
                <div style="background-color: #f3f4f6; border-radius: 6px; padding: 12px; margin-bottom: 8px;">
                  <strong style="color: #374151;">${wo.title}</strong>
                  <span style="color: #6b7280;"> • ${wo.propertyName}</span>
                  ${wo.priority === 'high' ? '<span style="background-color: #dc2626; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px; margin-left: 8px;">HIGH</span>' : ''}
                </div>
                `).join('')}
              </div>
              ` : ''}
            </td>
          </tr>

          <!-- Yesterday's Activity -->
          ${hasYesterdayActivity ? `
          <tr>
            <td style="padding: 0 40px 24px;">
              <h2 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #18181b; border-bottom: 2px solid #e4e4e7; padding-bottom: 8px;">
                📊 Yesterday's Activity
              </h2>
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                <tr>
                  ${yesterday.messagesSent > 0 ? `
                  <td style="padding: 12px; text-align: center; background-color: #f0f9ff; border-radius: 8px;">
                    <div style="font-size: 24px; font-weight: 700; color: #0369a1;">${yesterday.messagesSent}</div>
                    <div style="font-size: 12px; color: #0c4a6e;">Messages Sent</div>
                  </td>
                  ` : ''}
                  ${yesterday.newReservations > 0 ? `
                  <td style="padding: 12px; text-align: center; background-color: #f0fdf4; border-radius: 8px;">
                    <div style="font-size: 24px; font-weight: 700; color: #15803d;">${yesterday.newReservations}</div>
                    <div style="font-size: 12px; color: #14532d;">New Bookings</div>
                  </td>
                  ` : ''}
                  ${yesterday.completedWorkOrders > 0 ? `
                  <td style="padding: 12px; text-align: center; background-color: #faf5ff; border-radius: 8px;">
                    <div style="font-size: 24px; font-weight: 700; color: #7c3aed;">${yesterday.completedWorkOrders}</div>
                    <div style="font-size: 12px; color: #581c87;">Tasks Done</div>
                  </td>
                  ` : ''}
                </tr>
              </table>
            </td>
          </tr>
          ` : ''}

          <!-- Upcoming Preview -->
          ${hasUpcoming ? `
          <tr>
            <td style="padding: 0 40px 24px;">
              <h2 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #18181b; border-bottom: 2px solid #e4e4e7; padding-bottom: 8px;">
                🔮 Coming Up (Next 7 Days)
              </h2>
              
              ${upcoming.checkIns.length > 0 ? `
              <div style="margin-bottom: 16px;">
                <h3 style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #71717a;">Upcoming Check-Ins</h3>
                ${upcoming.checkIns.slice(0, 5).map(ci => `
                <div style="padding: 8px 0; border-bottom: 1px solid #f4f4f5;">
                  <strong style="color: #18181b;">${ci.guestName}</strong>
                  <span style="color: #71717a;"> • ${ci.propertyName}</span>
                  <span style="color: #a1a1aa; float: right;">${formatShortDate(ci.checkInDate)}</span>
                </div>
                `).join('')}
              </div>
              ` : ''}

              ${upcoming.pendingReservations.length > 0 ? `
              <div>
                <h3 style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #71717a;">⏳ Pending Payment</h3>
                ${upcoming.pendingReservations.slice(0, 3).map(pr => `
                <div style="padding: 8px 0; border-bottom: 1px solid #f4f4f5;">
                  <strong style="color: #18181b;">${pr.guestName}</strong>
                  <span style="color: #71717a;"> • ${pr.propertyName}</span>
                  <span style="color: #22c55e; float: right;">$${pr.totalAmount.toFixed(2)}</span>
                </div>
                `).join('')}
              </div>
              ` : ''}
            </td>
          </tr>
          ` : ''}

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #fafafa; text-align: center; border-top: 1px solid #e4e4e7;">
              <p style="margin: 0 0 8px; color: #71717a; font-size: 14px;">
                Have a great day! 🌟
              </p>
              <p style="margin: 0; color: #a1a1aa; font-size: 12px;">
                ${organizationName} • Powered by StayMoxie
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

serve(handler);
