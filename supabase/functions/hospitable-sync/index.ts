
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

const validateApiKey = (apiKey: string): boolean => {
  // Basic validation - Hospitable API keys are typically long strings
  return apiKey && apiKey.length > 10 && !apiKey.includes(' ');
};

const testApiConnection = async (apiKey: string): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('🔍 Testing Hospitable API connection...');
    
    // Test with a simple API call to verify authentication
    const testResponse = await fetch('https://api.hospitable.com/v1/properties', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!testResponse.ok) {
      const errorText = await testResponse.text();
      console.error(`❌ API test failed: ${testResponse.status} ${testResponse.statusText}`, errorText);
      
      if (testResponse.status === 401) {
        return {
          success: false,
          error: 'Invalid API key. Please check your Hospitable API key in the Supabase dashboard.'
        };
      } else if (testResponse.status === 403) {
        return {
          success: false,
          error: 'API key lacks required permissions. Please ensure your Hospitable API key has read access to bookings.'
        };
      } else if (testResponse.status === 429) {
        return {
          success: false,
          error: 'Rate limit exceeded. Please try again in a few minutes.'
        };
      } else {
        return {
          success: false,
          error: `API error: ${testResponse.status} ${testResponse.statusText}`
        };
      }
    }

    console.log('✅ API connection test successful');
    return { success: true };
  } catch (error) {
    console.error('❌ API connection test failed:', error);
    return {
      success: false,
      error: `Connection failed: ${error.message}`
    };
  }
};

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
    
    console.log('🏨 Starting Hospitable contact sync...');
    console.log(`🔑 API key present: ${!!hospitableApiKey}`);
    console.log(`🔑 API key length: ${hospitableApiKey?.length || 0}`);

    if (!hospitableApiKey) {
      console.error('❌ HOSPITABLE_API_KEY not found in environment');
      throw new Error('HOSPITABLE_API_KEY not configured. Please add your Hospitable API key in the Supabase dashboard under Settings > Edge Functions.');
    }

    if (!validateApiKey(hospitableApiKey)) {
      console.error('❌ Invalid API key format');
      throw new Error('Invalid Hospitable API key format. Please check your API key and ensure it\'s copied correctly.');
    }

    // Test API connection first
    const connectionTest = await testApiConnection(hospitableApiKey);
    if (!connectionTest.success) {
      throw new Error(connectionTest.error);
    }

    console.log('📋 Fetching bookings from Hospitable API...');

    // Fetch bookings from Hospitable API with improved error handling
    const bookingsResponse = await fetch('https://api.hospitable.com/v1/bookings', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${hospitableApiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!bookingsResponse.ok) {
      const errorText = await bookingsResponse.text();
      console.error(`❌ Bookings API error: ${bookingsResponse.status} ${bookingsResponse.statusText}`, errorText);
      
      if (bookingsResponse.status === 401) {
        throw new Error('Authentication failed. Your Hospitable API key may have expired or been revoked. Please generate a new API key.');
      } else if (bookingsResponse.status === 403) {
        throw new Error('Access denied. Your API key doesn\'t have permission to access bookings data.');
      } else if (bookingsResponse.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a few minutes before trying again.');
      } else {
        throw new Error(`Hospitable API error: ${bookingsResponse.status} ${bookingsResponse.statusText}. ${errorText}`);
      }
    }

    const bookingsData = await bookingsResponse.json();
    const bookings: HospitableBooking[] = bookingsData.data || bookingsData || [];

    console.log(`📋 Found ${bookings.length} bookings from Hospitable`);

    if (bookings.length === 0) {
      console.log('⚠️ No bookings found. This could mean:');
      console.log('   - No bookings exist in your Hospitable account');
      console.log('   - API key has limited access');
      console.log('   - Account has no booking data');
    }

    let syncedCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // Process each booking to extract guest contact information
    for (const booking of bookings) {
      const guest = booking.guest;
      
      if (!guest || !guest.email) {
        console.log(`⚠️ Skipping booking ${booking.id} - no guest email`);
        skippedCount++;
        continue;
      }

      try {
        console.log(`🔄 Processing guest: ${guest.email}`);

        // Check if subscriber already exists
        const { data: existingSubscriber, error: selectError } = await supabaseClient
          .from('newsletter_subscribers')
          .select('*')
          .eq('email', guest.email.toLowerCase())
          .single();

        if (selectError && selectError.code !== 'PGRST116') {
          console.error(`❌ Error checking existing subscriber ${guest.email}:`, selectError);
          errorCount++;
          continue;
        }

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
          needsUpdate = true;

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
              errorCount++;
            } else {
              console.log(`✅ Updated existing subscriber: ${guest.email}`);
              updatedCount++;
            }
          } else {
            console.log(`ℹ️ No updates needed for: ${guest.email}`);
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
            errorCount++;
          } else {
            console.log(`🆕 Created new subscriber: ${guest.email}`);
            syncedCount++;
          }
        }
      } catch (error) {
        console.error(`❌ Error processing guest ${guest.email}:`, error);
        errorCount++;
      }
    }

    const result = {
      success: true,
      message: `Hospitable sync completed successfully`,
      stats: {
        totalBookings: bookings.length,
        newSubscribers: syncedCount,
        updatedSubscribers: updatedCount,
        skippedContacts: skippedCount,
        errors: errorCount,
      }
    };

    console.log('🎉 Hospitable sync completed:', result.stats);

    if (errorCount > 0) {
      console.log(`⚠️ ${errorCount} errors occurred during sync. Check logs for details.`);
    }

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
        message: 'Failed to sync Hospitable contacts',
        troubleshooting: {
          commonIssues: [
            'Invalid or expired API key',
            'API key lacks required permissions',
            'Rate limiting from Hospitable API',
            'Network connectivity issues'
          ],
          nextSteps: [
            'Verify your Hospitable API key in Supabase dashboard',
            'Check API key permissions in Hospitable dashboard',
            'Try again in a few minutes if rate limited'
          ]
        }
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
