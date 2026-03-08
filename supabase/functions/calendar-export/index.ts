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
    
    // Support multiple auth URL formats:
    // 1) Preferred (single param): ?feed=<property_id>_<token>
    // 2) Legacy query params: ?property_id=<id>&token=<token>
    // 3) Optional path fallback: /calendar-export/<property_id>/<token>
    const pathParts = url.pathname.replace(/\/+$/, '').split('/')
    const pathPropertyId = pathParts.length > 2 ? pathParts[2] : null
    const pathToken = pathParts.length > 3 ? pathParts[3] : null

    const feed = url.searchParams.get('feed')
    const feedSeparatorIdx = feed?.lastIndexOf('_') ?? -1
    const feedPropertyId = feed && feedSeparatorIdx > 0 ? feed.slice(0, feedSeparatorIdx) : null
    const feedToken = feed && feedSeparatorIdx > 0 ? feed.slice(feedSeparatorIdx + 1) : null

    const propertyId = feedPropertyId || pathPropertyId || url.searchParams.get('property_id')
    const token = feedToken || pathToken || url.searchParams.get('token')

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

    // Get property details including the export token
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('id, title, location, calendar_export_token')
      .eq('id', propertyId)
      .single()

    if (propertyError || !property) {
      console.error('Property not found:', propertyError)
      return new Response(
        'Property not found',
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'text/plain' } }
      )
    }

    // Validate token if property has one set
    if (property.calendar_export_token && token !== property.calendar_export_token) {
      console.warn(`Invalid or missing token for property ${propertyId}`)
      return new Response(
        'Unauthorized - invalid or missing token',
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'text/plain' } }
      )
    }

    // Get all availability blocks - only confirmed bookings, exclude cancelled
    const { data: blocks, error: blocksError } = await supabase
      .from('availability_blocks')
      .select('*')
      .eq('property_id', propertyId)
      .in('block_type', ['booked', 'blocked', 'maintenance'])
      .neq('sync_status', 'cancelled')

    if (blocksError) {
      console.error('Error fetching availability blocks:', blocksError)
    }

    const availabilityBlocks = blocks || []

    console.log(`Found ${availabilityBlocks.length} availability blocks for export`)

    // Generate iCal content with privacy-safe data
    const icalContent = generateICalContent(property, availabilityBlocks, propertyId)

    return new Response(
      icalContent,
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'text/calendar; charset=utf-8',
          'Content-Disposition': `attachment; filename="${(property.title || 'property')?.replace(/[^a-zA-Z0-9]/g, '-')}-calendar.ics"`,
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        } 
      }
    )

  } catch (error: any) {
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
    'PRODID:-//StayMoxie//Calendar Export v2.0//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeICalText(property.title || 'Property')} - Availability`,
    `X-WR-CALDESC:Availability calendar for ${escapeICalText(property.title || 'Property')}`,
    'X-WR-TIMEZONE:UTC'
  ]

  // Add timezone definition for broader compatibility
  ical.push(
    'BEGIN:VTIMEZONE',
    'TZID:UTC',
    'BEGIN:STANDARD',
    'DTSTART:19700101T000000',
    'TZOFFSETFROM:+0000',
    'TZOFFSETTO:+0000',
    'END:STANDARD',
    'END:VTIMEZONE'
  )

  // Add all availability blocks as events - NO guest PII!
  blocks.forEach((block) => {
    const startDate = formatDateForICal(block.start_date)
    // iCal DTEND for all-day events is exclusive (day after last day)
    const endDate = formatDateForICal(addDays(block.end_date, 1))
    
    // Generate stable UID - use block ID for consistency
    const uid = `block-${block.id}@staymoxie.com`
    
    // Privacy-safe summary - never expose guest names or booking details
    let summary = 'Unavailable'
    if (block.block_type === 'booked') {
      summary = 'Booked'
    } else if (block.block_type === 'blocked') {
      summary = 'Blocked'
    } else if (block.block_type === 'maintenance') {
      summary = 'Maintenance'
    }
    
    // Description without PII
    const description = `Property: ${escapeICalText(property.title || 'Property')}\\nType: ${block.block_type}\\nSource: ${block.source_platform || 'StayMoxie'}`

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
      'CLASS:PRIVATE',
      'END:VEVENT'
    )
  })

  ical.push('END:VCALENDAR')

  return ical.join('\r\n')
}

function escapeICalText(text: string): string {
  if (!text) return ''
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

function formatDateForICal(dateStr: string): string {
  const date = new Date(dateStr)
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  return `${year}${month}${day}`
}

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().split('T')[0]
}
