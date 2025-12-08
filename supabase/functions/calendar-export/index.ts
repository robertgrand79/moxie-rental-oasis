import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const propertyId = url.searchParams.get('property_id')

    if (!propertyId) {
      return new Response(
        'Missing property_id parameter',
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'text/plain' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log(`Generating iCal export for property ${propertyId}`)

    // Get property details
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('title, location')
      .eq('id', propertyId)
      .single()

    if (propertyError || !property) {
      return new Response(
        'Property not found',
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'text/plain' } }
      )
    }

    // Get all availability blocks (contains both direct bookings and external calendar syncs)
    const { data: blocks, error: blocksError } = await supabase
      .from('availability_blocks')
      .select('*')
      .eq('property_id', propertyId)
      .eq('block_type', 'booked')

    if (blocksError) {
      console.error('Error fetching availability blocks:', blocksError)
    }

    const availabilityBlocks = blocks || []

    console.log(`Found ${availabilityBlocks.length} availability blocks for export`)

    // Generate iCal content
    const icalContent = generateICalContent(property, availabilityBlocks, propertyId)

    return new Response(
      icalContent,
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'text/calendar; charset=utf-8',
          'Content-Disposition': `attachment; filename="${property.title?.replace(/[^a-zA-Z0-9]/g, '-')}-calendar.ics"`
        } 
      }
    )

  } catch (error) {
    console.error('Calendar export error:', error)

    return new Response(
      `Calendar export failed: ${error.message}`,
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'text/plain' } }
    )
  }
})

function generateICalContent(property: any, blocks: any[], propertyId: string): string {
  const now = new Date()
  const timestamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'

  let ical = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Vacation Rentals//Calendar Export//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${property.title || 'Property'} - Bookings`,
    `X-WR-CALDESC:Availability calendar for ${property.title || 'Property'} at ${property.location || 'Location'}`,
    'X-WR-TIMEZONE:America/Los_Angeles'
  ]

  // Add all availability blocks as events
  blocks.forEach((block) => {
    const startDate = formatDateForICal(block.start_date)
    const endDate = formatDateForICal(addDays(block.end_date, 1)) // End date is exclusive in iCal
    const uid = block.external_booking_id || `block-${block.id}-${propertyId}`
    const summary = block.notes || `Booked - ${property.title}`
    const source = block.source_platform || 'Unknown'
    const description = `Property: ${property.title}\\nLocation: ${property.location}\\nSource: ${source}`

    ical.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${timestamp}`,
      `DTSTART;VALUE=DATE:${startDate}`,
      `DTEND;VALUE=DATE:${endDate}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      'STATUS:CONFIRMED',
      'TRANSP:OPAQUE',
      'END:VEVENT'
    )
  })

  ical.push('END:VCALENDAR')

  return ical.join('\r\n')
}

function formatDateForICal(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toISOString().split('T')[0].replace(/-/g, '')
}

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr)
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}
