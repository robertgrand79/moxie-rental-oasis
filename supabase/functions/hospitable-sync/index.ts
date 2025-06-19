
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HospitableGuest {
  id: string;
  name: string;
  email: string;
  phone?: string;
  created_at: string;
  last_booking_date?: string;
}

interface HospitableBooking {
  id: string;
  guest: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  check_in: string;
  check_out: string;
  status: string;
  created_at: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const hospitableApiKey = Deno.env.get('HOSPITABLE_API_KEY');
    if (!hospitableApiKey) {
      throw new Error('HOSPITABLE_API_KEY not configured');
    }

    console.log('🏨 Starting Hospitable contact sync...');

    // Fetch bookings from Hospitable API
    const bookingsResponse = await fetch('https://api.hospitable.com/v1/bookings', {
      headers: {
        'Authorization': `Bearer ${hospitableApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!bookingsResponse.ok) {
      throw new Error(`Hospitable API error: ${bookingsResponse.status} ${bookingsResponse.statusText}`);
    }

    const bookingsData = await bookingsResponse.json();
    const bookings: HospitableBooking[] = bookingsData.data || [];

    console.log(`📋 Found ${bookings.length} bookings from Hospitable`);

    let syncedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    // Process each booking to extract guest contact information
    for (const booking of bookings) {
      const guest = booking.guest;
      
      if (!guest.email) {
        console.log(`⚠️ Skipping guest ${guest.name} - no email`);
        skippedCount++;
        continue;
      }

      try {
        // Check if subscriber already exists
        const { data: existingSubscriber } = await supabaseClient
          .from('newsletter_subscribers')
          .select('*')
          .eq('email', guest.email.toLowerCase())
          .single();

        if (existingSubscriber) {
          // Update existing subscriber with Hospitable data if needed
          const updates: any = {};
          let needsUpdate = false;

          if (!existingSubscriber.name && guest.name) {
            updates.name = guest.name;
            needsUpdate = true;
          }

          if (!existingSubscriber.phone && guest.phone) {
            updates.phone = guest.phone;
            needsUpdate = true;
          }

          // Update contact source if it's not already from Hospitable
          if (existingSubscriber.contact_source !== 'hospitable') {
            updates.contact_source = 'hospitable';
            needsUpdate = true;
          }

          // Update last engagement date
          updates.last_engagement_date = booking.check_out || booking.created_at;

          if (needsUpdate) {
            const { error: updateError } = await supabaseClient
              .from('newsletter_subscribers')
              .update({
                ...updates,
                updated_at: new Date().toISOString(),
              })
              .eq('id', existingSubscriber.id);

            if (updateError) {
              console.error(`❌ Error updating subscriber ${guest.email}:`, updateError);
            } else {
              console.log(`✅ Updated existing subscriber: ${guest.email}`);
              updatedCount++;
            }
          } else {
            skippedCount++;
          }
        } else {
          // Create new subscriber from Hospitable guest
          const { error: insertError } = await supabaseClient
            .from('newsletter_subscribers')
            .insert({
              email: guest.email.toLowerCase(),
              name: guest.name || null,
              phone: guest.phone || null,
              is_active: true,
              email_opt_in: true, // Default to true for past guests
              sms_opt_in: false, // Default to false, let them opt-in
              communication_preferences: {
                frequency: 'monthly',
                preferred_time: 'evening'
              },
              contact_source: 'hospitable',
              last_engagement_date: booking.check_out || booking.created_at,
            });

          if (insertError) {
            console.error(`❌ Error creating subscriber ${guest.email}:`, insertError);
          } else {
            console.log(`🆕 Created new subscriber: ${guest.email}`);
            syncedCount++;
          }
        }
      } catch (error) {
        console.error(`❌ Error processing guest ${guest.email}:`, error);
      }
    }

    const result = {
      success: true,
      message: `Hospitable sync completed`,
      stats: {
        totalBookings: bookings.length,
        newSubscribers: syncedCount,
        updatedSubscribers: updatedCount,
        skippedContacts: skippedCount,
      }
    };

    console.log('🎉 Hospitable sync completed:', result.stats);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('❌ Hospitable sync error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        message: 'Failed to sync Hospitable contacts'
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
