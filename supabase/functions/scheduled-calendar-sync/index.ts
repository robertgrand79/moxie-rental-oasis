import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log('🔄 Starting scheduled calendar sync...');

  try {
    // Fetch all active external calendars
    const { data: calendars, error: fetchError } = await supabase
      .from('external_calendars')
      .select('id, property_id, platform, calendar_url, sync_enabled')
      .eq('sync_enabled', true);

    if (fetchError) {
      console.error('❌ Error fetching calendars:', fetchError);
      throw fetchError;
    }

    console.log(`📅 Found ${calendars?.length || 0} calendars to sync`);

    const results = {
      total: calendars?.length || 0,
      success: 0,
      failed: 0,
      errors: [] as string[]
    };

    for (const calendar of calendars || []) {
      try {
        console.log(`🔄 Syncing ${calendar.platform} calendar for property ${calendar.property_id}`);

        // Skip demo calendars
        if (calendar.platform === 'demo') {
          console.log('⏭️ Skipping demo calendar');
          results.success++;
          continue;
        }

        // Fetch iCal data
        const response = await fetch(calendar.calendar_url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; CalendarSync/1.0)',
            'Accept': 'text/calendar, */*'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const icalData = await response.text();

        // Parse and store events
        const events = parseICalEvents(icalData);
        console.log(`📊 Parsed ${events.length} events from ${calendar.platform}`);

        // Delete existing blocks for this source
        await supabase
          .from('availability_blocks')
          .delete()
          .eq('property_id', calendar.property_id)
          .eq('source_platform', calendar.platform);

        // Insert new events
        if (events.length > 0) {
          const blocks = events.map(event => ({
            property_id: calendar.property_id,
            start_date: event.startDate,
            end_date: event.endDate,
            block_type: 'booked',
            source_platform: calendar.platform,
            external_booking_id: event.uid,
            notes: event.summary,
            sync_status: 'synced'
          }));

          const { error: insertError } = await supabase
            .from('availability_blocks')
            .insert(blocks);

          if (insertError) {
            throw new Error(`Failed to insert blocks: ${insertError.message}`);
          }
        }

        // Update sync status
        await supabase
          .from('external_calendars')
          .update({
            sync_status: 'synced',
            last_sync_at: new Date().toISOString(),
            sync_errors: []
          })
          .eq('id', calendar.id);

        results.success++;
        console.log(`✅ Successfully synced ${calendar.platform} calendar`);

      } catch (error: any) {
        console.error(`❌ Failed to sync calendar ${calendar.id}:`, error.message);
        results.failed++;
        results.errors.push(`${calendar.platform} (${calendar.property_id}): ${error.message}`);

        // Update sync status with error
        await supabase
          .from('external_calendars')
          .update({
            sync_status: 'failed',
            sync_errors: [error.message]
          })
          .eq('id', calendar.id);
      }
    }

    console.log(`✅ Scheduled sync complete: ${results.success}/${results.total} succeeded`);

    return new Response(JSON.stringify({
      success: true,
      message: `Synced ${results.success}/${results.total} calendars`,
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('❌ Scheduled sync error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function parseICalEvents(icalData: string) {
  const events: Array<{ uid: string; startDate: string; endDate: string; summary: string }> = [];
  const lines = icalData.split(/\r?\n/);
  
  let currentEvent: any = null;
  
  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      currentEvent = {};
    } else if (line === 'END:VEVENT' && currentEvent) {
      if (currentEvent.startDate && currentEvent.endDate) {
        events.push({
          uid: currentEvent.uid || `generated-${Date.now()}-${Math.random()}`,
          startDate: currentEvent.startDate,
          endDate: currentEvent.endDate,
          summary: currentEvent.summary || 'Blocked'
        });
      }
      currentEvent = null;
    } else if (currentEvent) {
      if (line.startsWith('DTSTART')) {
        const dateStr = line.split(':')[1];
        currentEvent.startDate = formatDate(dateStr);
      } else if (line.startsWith('DTEND')) {
        const dateStr = line.split(':')[1];
        currentEvent.endDate = formatDate(dateStr);
      } else if (line.startsWith('SUMMARY:')) {
        currentEvent.summary = line.substring(8);
      } else if (line.startsWith('UID:')) {
        currentEvent.uid = line.substring(4);
      }
    }
  }
  
  return events;
}

function formatDate(dateStr: string): string {
  // Handle both DATE (YYYYMMDD) and DATETIME (YYYYMMDDTHHmmssZ) formats
  const cleanDate = dateStr.replace(/[TZ]/g, '').substring(0, 8);
  if (cleanDate.length === 8) {
    return `${cleanDate.substring(0, 4)}-${cleanDate.substring(4, 6)}-${cleanDate.substring(6, 8)}`;
  }
  return dateStr;
}
