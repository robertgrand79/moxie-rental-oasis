import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { platform, calendarUrl, propertyId } = await req.json()

    console.log('🔄 Starting calendar sync for platform:', platform)
    console.log('📥 Fetching calendar from URL:', calendarUrl.substring(0, 50) + '...')

    // Special handling for demo mode
    if (platform === 'demo') {
      console.log('🧪 Demo mode activated - simulating successful calendar sync')
      
      const mockEventCount = 12
      
      // Store the demo calendar sync in the database
      const { error: calendarError } = await supabase
        .from('external_calendars')
        .upsert({
          property_id: propertyId,
          platform: 'demo',
          calendar_url: 'demo://mock-calendar-for-testing',
          sync_enabled: true,
          sync_status: 'synced',
          last_sync_at: new Date().toISOString(),
          external_property_id: `demo-${propertyId}`
        }, {
          onConflict: 'property_id,platform'
        })

      if (calendarError) {
        console.error('❌ Database error:', calendarError)
        throw new Error(`Database error: ${calendarError.message}`)
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: `✅ Demo calendar sync completed! Found ${mockEventCount} sample bookings.`,
          events: mockEventCount
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Fetch the iCal data from the external URL
    console.log('📥 Fetching iCal data from external URL...')
    
    const response = await fetch(calendarUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CalendarSync/1.0)',
        'Accept': 'text/calendar,*/*'
      }
    })
    
    if (!response.ok) {
      console.error('❌ Failed to fetch calendar:', response.status, response.statusText)
      throw new Error(`Failed to fetch calendar data: ${response.status} ${response.statusText}`)
    }

    const icalData = await response.text()
    console.log('✅ iCal data fetched successfully, length:', icalData.length)

    // Parse the basic events count for user feedback
    const eventCount = (icalData.match(/BEGIN:VEVENT/g) || []).length
    console.log('📅 Found events:', eventCount)

    // Validate that it's actually iCal data
    if (!icalData.includes('BEGIN:VCALENDAR')) {
      throw new Error('Invalid iCal data received - not a valid calendar format')
    }

    // Store the calendar sync information in the database
    const { error: calendarError } = await supabase
      .from('external_calendars')
      .upsert({
        property_id: propertyId,
        platform: platform,
        calendar_url: calendarUrl,
        sync_enabled: true,
        sync_status: 'synced',
        last_sync_at: new Date().toISOString(),
        external_property_id: `${platform}-${propertyId}`
      }, {
        onConflict: 'property_id,platform'
      })

    if (calendarError) {
      console.error('❌ Database error:', calendarError)
      throw new Error(`Database error: ${calendarError.message}`)
    }

    console.log('✅ Calendar sync completed successfully')

    return new Response(
      JSON.stringify({
        success: true,
        message: `Calendar sync completed successfully. Found ${eventCount} events.`,
        events: eventCount,
        platform,
        lastSync: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error: any) {
    console.error('🚨 Calendar sync error:', error)
    
    // Provide more specific error messages
    let errorMessage = error.message
    if (errorMessage.includes('Failed to fetch calendar data: 404')) {
      errorMessage = 'Calendar URL returned 404 - the URL may be expired or invalid. Please generate a new export URL from your platform.'
    } else if (errorMessage.includes('Failed to fetch calendar data: 403')) {
      errorMessage = 'Access denied to calendar URL. Please check that the calendar is set to public/exportable.'
    } else if (errorMessage.includes('NetworkError') || errorMessage.includes('fetch')) {
      errorMessage = 'Network error occurred while fetching calendar data. Please try again.'
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        details: error.message
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})