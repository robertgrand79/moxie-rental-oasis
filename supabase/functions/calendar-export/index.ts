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

    // Get availability blocks (bookings) for this property
    const { data: blocks, error: blocksError } = await supabase
      .from('availability_blocks')
      .select('*')
      .eq('property_id', propertyId)
      .eq('block_type', 'booked')

    if (blocksError) {
      console.error('Error fetching availability blocks:', blocksError)
    }

    // Get direct bookings from reservations table
    const { data: reservations, error: reservationsError } = await supabase
      .from('reservations')
      .select('*')
      .eq('property_id', propertyId)
      .in('booking_status', ['confirmed', 'active'])

    if (reservationsError) {
      console.error('Error fetching reservations:', reservationsError)
    }

    const availabilityBlocks = blocks || []
    const directBookings = reservations || []

    console.log(`Found ${availabilityBlocks.length} availability blocks and ${directBookings.length} direct bookings`)

    // Generate iCal content
    const icalContent = generateICalContent(property, availabilityBlocks, directBookings, propertyId)

    const totalEvents = availabilityBlocks.length + directBookings.length
    console.log(`Generated iCal with ${totalEvents} total events (${directBookings.length} direct + ${availabilityBlocks.length} external)`)

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

function generateICalContent(property: any, blocks: any[], reservations: any[], propertyId: string): string {
  const now = new Date()
  const timestamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'

  let ical = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Moxie Vacation Rentals//Calendar Export//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${property.title || 'Property'} - Bookings`,
    `X-WR-CALDESC:Availability calendar for ${property.title || 'Property'} at ${property.location || 'Location'}`,
    'X-WR-TIMEZONE:America/Los_Angeles'
  ]

  // Add availability blocks (external bookings)
  blocks.forEach((block) => {
    const startDate = formatDateForICal(block.start_date)
    const endDate = formatDateForICal(addDays(block.end_date, 1)) // End date is exclusive in iCal
    const uid = block.external_booking_id || `block-${block.id}-${propertyId}`
    const summary = block.notes || `Booked - ${property.title}`
    const description = `Property: ${property.title}\\nLocation: ${property.location}\\nSource: ${block.source_platform || 'External Calendar'}`

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

  // Add direct bookings from reservations table
  reservations.forEach((reservation) => {
    const startDate = formatDateForICal(reservation.check_in_date)
    const endDate = formatDateForICal(addDays(reservation.check_out_date, 1)) // End date is exclusive in iCal
    const uid = reservation.external_booking_id || `reservation-${reservation.id}-${propertyId}`
    const summary = `Booked - ${reservation.guest_name}`
    const description = `Property: ${property.title}\\nGuest: ${reservation.guest_name}\\nEmail: ${reservation.guest_email}\\nGuests: ${reservation.guest_count}\\nSource: Direct Booking\\nConfirmation: ${reservation.confirmation_code}`

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