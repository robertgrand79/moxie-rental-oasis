import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function generateSuccessPage(workOrderCount: number, contractorName: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Work Orders Acknowledged</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .container {
          background: white;
          border-radius: 24px;
          padding: 60px 40px;
          text-align: center;
          max-width: 500px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
        }
        .icon {
          width: 80px;
          height: 80px;
          background: #10b981;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          animation: scale-in 0.5s ease-out;
        }
        @keyframes scale-in {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        .icon svg {
          width: 40px;
          height: 40px;
          color: white;
        }
        h1 {
          font-size: 28px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 16px;
        }
        p {
          font-size: 18px;
          color: #4b5563;
          line-height: 1.6;
          margin-bottom: 24px;
        }
        .details {
          background: #f8fafc;
          border-radius: 12px;
          padding: 20px;
          margin-top: 24px;
        }
        .details p {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 0;
        }
        .logo {
          font-size: 24px;
          font-weight: 800;
          color: #1f2937;
          margin-bottom: 8px;
        }
        .tagline {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 24px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">Moxie Vacation Rentals</div>
        <div class="tagline">Your Home Base for Living Like a Local</div>
        
        <div class="icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        
        <h1>Thank You, ${contractorName}!</h1>
        <p>You have successfully acknowledged receipt of ${workOrderCount} work order${workOrderCount > 1 ? 's' : ''}.</p>
        
        <div class="details">
          <p>We've recorded your acknowledgment and updated our records. You can close this window now.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateErrorPage(message: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Acknowledgment Error</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .container {
          background: white;
          border-radius: 24px;
          padding: 60px 40px;
          text-align: center;
          max-width: 500px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
        }
        .icon {
          width: 80px;
          height: 80px;
          background: #ef4444;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
        }
        .icon svg {
          width: 40px;
          height: 40px;
          color: white;
        }
        h1 {
          font-size: 28px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 16px;
        }
        p {
          font-size: 18px;
          color: #4b5563;
          line-height: 1.6;
        }
        .logo {
          font-size: 24px;
          font-weight: 800;
          color: #1f2937;
          margin-bottom: 8px;
        }
        .tagline {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 24px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">Moxie Vacation Rentals</div>
        <div class="tagline">Your Home Base for Living Like a Local</div>
        
        <div class="icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>
        
        <h1>Oops!</h1>
        <p>${message}</p>
      </div>
    </body>
    </html>
  `;
}

function generateAlreadyAcknowledgedPage(contractorName: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Already Acknowledged</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .container {
          background: white;
          border-radius: 24px;
          padding: 60px 40px;
          text-align: center;
          max-width: 500px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
        }
        .icon {
          width: 80px;
          height: 80px;
          background: #3b82f6;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
        }
        .icon svg {
          width: 40px;
          height: 40px;
          color: white;
        }
        h1 {
          font-size: 28px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 16px;
        }
        p {
          font-size: 18px;
          color: #4b5563;
          line-height: 1.6;
        }
        .logo {
          font-size: 24px;
          font-weight: 800;
          color: #1f2937;
          margin-bottom: 8px;
        }
        .tagline {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 24px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">Moxie Vacation Rentals</div>
        <div class="tagline">Your Home Base for Living Like a Local</div>
        
        <div class="icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        
        <h1>Already Acknowledged</h1>
        <p>Hi ${contractorName}! These work orders have already been acknowledged. No further action is needed.</p>
      </div>
    </body>
    </html>
  `;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return new Response(generateErrorPage("Invalid acknowledgment link. Please use the link from your email."), {
        headers: { "Content-Type": "text/html", ...corsHeaders },
      });
    }

    console.log("Processing acknowledgment for token:", token);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Fetch acknowledgment record
    const { data: ackRecord, error: ackError } = await supabase
      .from("work_order_acknowledgments")
      .select("*, contractor:contractors(name)")
      .eq("token", token)
      .single();

    if (ackError || !ackRecord) {
      console.error("Acknowledgment record not found:", ackError);
      return new Response(generateErrorPage("This acknowledgment link is invalid or has expired."), {
        headers: { "Content-Type": "text/html", ...corsHeaders },
      });
    }

    const contractorName = ackRecord.contractor?.name || "Contractor";

    // Check if already acknowledged
    if (ackRecord.acknowledged_at) {
      console.log("Already acknowledged at:", ackRecord.acknowledged_at);
      return new Response(generateAlreadyAcknowledgedPage(contractorName), {
        headers: { "Content-Type": "text/html", ...corsHeaders },
      });
    }

    const now = new Date().toISOString();

    // Update acknowledgment record
    const { error: updateAckError } = await supabase
      .from("work_order_acknowledgments")
      .update({ acknowledged_at: now })
      .eq("id", ackRecord.id);

    if (updateAckError) {
      console.error("Error updating acknowledgment record:", updateAckError);
    }

    // Update all work orders
    const { error: updateWoError } = await supabase
      .from("work_orders")
      .update({
        status: "acknowledged",
        acknowledged_at: now,
      })
      .in("id", ackRecord.work_order_ids);

    if (updateWoError) {
      console.error("Error updating work orders:", updateWoError);
    }

    console.log("Successfully acknowledged", ackRecord.work_order_ids.length, "work orders");

    return new Response(generateSuccessPage(ackRecord.work_order_ids.length, contractorName), {
      headers: { "Content-Type": "text/html", ...corsHeaders },
    });
  } catch (error) {
    console.error("Error in acknowledge-work-orders function:", error);
    return new Response(generateErrorPage("Something went wrong. Please try again later."), {
      headers: { "Content-Type": "text/html", ...corsHeaders },
    });
  }
});
