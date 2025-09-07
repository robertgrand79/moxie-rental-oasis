import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CalendarEvent {
  start: string
  end: string
  summary: string
  uid: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { propertyId, calendarUrl, platform } = await req.json()

    if (!propertyId || !calendarUrl || !platform) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: propertyId, calendarUrl, platform' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Starting calendar sync for property ${propertyId} from ${platform}`)

    // Fetch iCal data
    const icalResponse = await fetch(calendarUrl)
    if (!icalResponse.ok) {
      throw new Error(`Failed to fetch calendar: ${icalResponse.status}`)
    }

    const icalData = await icalResponse.text()
    console.log(`Fetched iCal data, length: ${icalData.length}`)

    // Parse iCal data
    const events = parseICalData(icalData)
    console.log(`Parsed ${events.length} events`)

    // Update external calendar record
    const { error: calendarError } = await supabase
      .from('external_calendars')
      .upsert({
        property_id: propertyId,
        platform: platform,
        calendar_url: calendarUrl,
        sync_enabled: true,
        sync_status: 'syncing',
        last_sync_at: new Date().toISOString(),
        external_property_id: `${platform}-${propertyId}`
      }, {
        onConflict: 'property_id,platform'
      })

    if (calendarError) {
      console.error('Error updating external calendar:', calendarError)
    }

    // Clear existing availability blocks for this property and platform
    const { error: deleteError } = await supabase
      .from('availability_blocks')
      .delete()
      .eq('property_id', propertyId)
      .eq('source_platform', platform)

    if (deleteError) {
      console.error('Error clearing old availability blocks:', deleteError)
    }

    // Insert new availability blocks
    const availabilityBlocks = events.map(event => ({
      property_id: propertyId,
      start_date: event.start.split('T')[0], // Extract date part
      end_date: event.end.split('T')[0],
      block_type: 'booked' as const,
      source_platform: platform,
      external_booking_id: event.uid,
      notes: event.summary,
      sync_status: 'synced' as const
    }))

    if (availabilityBlocks.length > 0) {
      const { error: insertError } = await supabase
        .from('availability_blocks')
        .insert(availabilityBlocks)

      if (insertError) {
        console.error('Error inserting availability blocks:', insertError)
        throw insertError
      }
    }

    // Update sync status to completed
    await supabase
      .from('external_calendars')
      .update({
        sync_status: 'synced',
        sync_errors: null
      })
      .eq('property_id', propertyId)
      .eq('platform', platform)

    console.log(`Successfully synced ${availabilityBlocks.length} availability blocks`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully synced ${availabilityBlocks.length} bookings from ${platform}`,
        events: availabilityBlocks.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Calendar sync error:', error)

    return new Response(
      JSON.stringify({
        error: 'Calendar sync failed',
        message: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function parseICalData(icalData: string): CalendarEvent[] {
  const events: CalendarEvent[] = []
  const lines = icalData.split('\n').map(line => line.trim())
  
  let currentEvent: Partial<CalendarEvent> = {}
  let inEvent = false

  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      inEvent = true
      currentEvent = {}
    } else if (line === 'END:VEVENT' && inEvent) {
      if (currentEvent.start && currentEvent.end && currentEvent.uid) {
        events.push(currentEvent as CalendarEvent)
      }
      inEvent = false
    } else if (inEvent) {
      if (line.startsWith('DTSTART')) {
        const dateValue = line.split(':')[1] || line.split('=').pop()
        if (dateValue) {
          currentEvent.start = formatICalDate(dateValue)
        }
      } else if (line.startsWith('DTEND')) {
        const dateValue = line.split(':')[1] || line.split('=').pop()
        if (dateValue) {
          currentEvent.end = formatICalDate(dateValue)
        }
      } else if (line.startsWith('SUMMARY:')) {
        currentEvent.summary = line.substring(8)
      } else if (line.startsWith('UID:')) {
        currentEvent.uid = line.substring(4)
      }
    }
  }

  return events
}

function formatICalDate(dateStr: string): string {
  // Handle different iCal date formats
  if (dateStr.includes('T')) {
    // DateTime format: 20241201T160000Z
    const cleanDate = dateStr.replace(/[TZ]/g, '')
    const year = cleanDate.substring(0, 4)
    const month = cleanDate.substring(4, 6)
    const day = cleanDate.substring(6, 8)
    const hour = cleanDate.substring(8, 10) || '00'
    const minute = cleanDate.substring(10, 12) || '00'
    const second = cleanDate.substring(12, 14) || '00'
    
    return `${year}-${month}-${day}T${hour}:${minute}:${second}.000Z`
  } else {
    // Date only format: 20241201
    const year = dateStr.substring(0, 4)
    const month = dateStr.substring(4, 6)
    const day = dateStr.substring(6, 8)
    
    return `${year}-${month}-${day}T00:00:00.000Z`
  }
}