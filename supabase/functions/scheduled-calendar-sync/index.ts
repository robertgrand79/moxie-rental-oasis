import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_CONSECUTIVE_FAILURES = 5;
const NOTIFICATION_THRESHOLD = 3;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log('🔄 Starting scheduled calendar sync...');
  const overallStartTime = Date.now();

  try {
    // Fetch all active external calendars that haven't exceeded failure threshold
    const { data: calendars, error: fetchError } = await supabase
      .from('external_calendars')
      .select(`
        id, 
        property_id, 
        platform, 
        calendar_url, 
        sync_enabled,
        consecutive_failures,
        last_sync_at
      `)
      .eq('sync_enabled', true)
      .lt('consecutive_failures', MAX_CONSECUTIVE_FAILURES);

    if (fetchError) {
      console.error('❌ Error fetching calendars:', fetchError);
      throw fetchError;
    }

    console.log(`📅 Found ${calendars?.length || 0} calendars to sync`);

    const results = {
      total: calendars?.length || 0,
      success: 0,
      failed: 0,
      skipped: 0,
      errors: [] as string[]
    };

    // Process calendars with rate limiting
    for (const calendar of calendars || []) {
      const syncStartTime = Date.now();
      
      try {
        console.log(`🔄 Syncing ${calendar.platform} calendar for property ${calendar.property_id}`);

        // Skip demo calendars
        if (calendar.platform === 'demo') {
          console.log('⏭️ Skipping demo calendar');
          results.skipped++;
          continue;
        }

        // Skip calendars without URL
        if (!calendar.calendar_url) {
          console.log('⏭️ Skipping calendar without URL');
          results.skipped++;
          continue;
        }

        // Fetch iCal data with timeout
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 20000); // 20 second timeout

        let response: Response;
        try {
          response = await fetch(calendar.calendar_url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; StayMoxie/1.0; +https://staymoxie.com)',
              'Accept': 'text/calendar, */*'
            },
            signal: controller.signal
          });
        } catch (fetchError: any) {
          if (fetchError.name === 'AbortError') {
            throw new Error('Fetch timed out after 20 seconds');
          }
          throw fetchError;
        } finally {
          clearTimeout(timeout);
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const icalData = await response.text();
        
        if (!icalData.includes('BEGIN:VCALENDAR')) {
          throw new Error('Invalid iCal data received');
        }

        // Parse events
        const { events, cancelledCount } = parseICalEvents(icalData, calendar.property_id, calendar.platform);
        console.log(`📊 Parsed ${events.length} events from ${calendar.platform}, ${cancelledCount} cancelled`);

        // Count existing blocks before deletion
        const { data: existingBlocks } = await supabase
          .from('availability_blocks')
          .select('id')
          .eq('property_id', calendar.property_id)
          .eq('source_platform', calendar.platform);

        const existingCount = existingBlocks?.length || 0;

        // Delete existing blocks for this source
        await supabase
          .from('availability_blocks')
          .delete()
          .eq('property_id', calendar.property_id)
          .eq('source_platform', calendar.platform);

        // Insert new events
        if (events.length > 0) {
          const { error: insertError } = await supabase
            .from('availability_blocks')
            .insert(events);

          if (insertError) {
            throw new Error(`Failed to insert blocks: ${insertError.message}`);
          }
        }

        const syncDuration = Date.now() - syncStartTime;

        // Update sync status
        await supabase
          .from('external_calendars')
          .update({
            sync_status: 'synced',
            last_sync_at: new Date().toISOString(),
            sync_errors: [],
            consecutive_failures: 0,
            events_count: events.length
          })
          .eq('id', calendar.id);

        // Log successful sync
        await supabase
          .from('calendar_sync_logs')
          .insert({
            external_calendar_id: calendar.id,
            property_id: calendar.property_id,
            platform: calendar.platform,
            sync_type: 'scheduled',
            status: 'success',
            events_synced: events.length,
            events_removed: existingCount,
            duration_ms: syncDuration
          });

        results.success++;
        console.log(`✅ Successfully synced ${calendar.platform} calendar (${syncDuration}ms)`);

        // Add small delay between syncs to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error: any) {
        const syncDuration = Date.now() - syncStartTime;
        console.error(`❌ Failed to sync calendar ${calendar.id}:`, error.message);
        results.failed++;
        results.errors.push(`${calendar.platform} (${calendar.property_id}): ${error.message}`);

        const newFailureCount = (calendar.consecutive_failures || 0) + 1;

        // Update sync status with error
        await supabase
          .from('external_calendars')
          .update({
            sync_status: 'failed',
            sync_errors: [error.message],
            consecutive_failures: newFailureCount,
            last_failure_at: new Date().toISOString()
          })
          .eq('id', calendar.id);

        // Log failed sync
        await supabase
          .from('calendar_sync_logs')
          .insert({
            external_calendar_id: calendar.id,
            property_id: calendar.property_id,
            platform: calendar.platform,
            sync_type: 'scheduled',
            status: 'failed',
            error_message: error.message,
            duration_ms: syncDuration
          });

        // Send notification to owner if threshold reached
        if (newFailureCount === NOTIFICATION_THRESHOLD) {
          await notifyOwnerOfSyncFailure(supabase, calendar, error.message);
        }
      }
    }

    const totalDuration = Date.now() - overallStartTime;
    console.log(`✅ Scheduled sync complete: ${results.success}/${results.total} succeeded in ${totalDuration}ms`);

    return new Response(JSON.stringify({
      success: true,
      message: `Synced ${results.success}/${results.total} calendars`,
      results,
      durationMs: totalDuration
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

async function notifyOwnerOfSyncFailure(supabase: any, calendar: any, errorMessage: string) {
  try {
    // Get property and org info
    const { data: property } = await supabase
      .from('properties')
      .select('title, organization_id')
      .eq('id', calendar.property_id)
      .single();

    if (property?.organization_id) {
      await supabase
        .from('admin_notifications')
        .insert({
          organization_id: property.organization_id,
          notification_type: 'calendar_sync_failure',
          category: 'integration',
          title: `Calendar Sync Failing for ${property.title}`,
          message: `The ${calendar.platform} calendar sync has failed ${NOTIFICATION_THRESHOLD} times in a row. Error: ${errorMessage}. Please verify the calendar URL is still valid.`,
          priority: 'high',
          action_url: `/admin/properties/${calendar.property_id}`
        });
      console.log(`📧 Notification sent for sync failures on property ${calendar.property_id}`);
    }
  } catch (notifyError) {
    console.error('Failed to send sync failure notification:', notifyError);
  }
}

interface ParsedEvent {
  property_id: string
  block_type: string
  start_date: string
  end_date: string
  notes: string
  external_booking_id: string
  source_platform: string
  guest_count: number
  sync_status: string
}

function parseICalEvents(icalData: string, propertyId: string, platform: string): { events: ParsedEvent[], cancelledCount: number } {
  const events: ParsedEvent[] = [];
  let cancelledCount = 0;
  
  // Handle line folding
  const unfoldedData = icalData.replace(/\r?\n[ \t]/g, '');
  const lines = unfoldedData.split(/\r?\n/);
  
  let currentEvent: any = null;
  
  for (const line of lines) {
    if (line === 'BEGIN:VEVENT') {
      currentEvent = {};
    } else if (line === 'END:VEVENT' && currentEvent) {
      if (currentEvent.status === 'CANCELLED') {
        cancelledCount++;
        currentEvent = null;
        continue;
      }
      
      if (currentEvent.startDate && currentEvent.endDate) {
        const startDate = parseDate(currentEvent.startDate);
        let endDate = parseDate(currentEvent.endDate);
        
        if (startDate && endDate) {
          // Adjust end date for all-day events (iCal uses exclusive end)
          if (currentEvent.isAllDay) {
            const adjustedEnd = new Date(endDate);
            adjustedEnd.setDate(adjustedEnd.getDate() - 1);
            endDate = adjustedEnd.toISOString().split('T')[0];
          }
          
          events.push({
            property_id: propertyId,
            block_type: 'booked',
            start_date: startDate,
            end_date: endDate,
            notes: currentEvent.summary || 'Blocked',
            external_booking_id: currentEvent.uid || `${platform}-${Date.now()}-${Math.random()}`,
            source_platform: platform,
            guest_count: 1,
            sync_status: 'synced'
          });
        }
      }
      currentEvent = null;
    } else if (currentEvent) {
      const colonIndex = line.indexOf(':');
      if (colonIndex > -1) {
        const fullKey = line.substring(0, colonIndex);
        const value = line.substring(colonIndex + 1);
        const key = fullKey.split(';')[0];
        
        if (key === 'DTSTART') {
          currentEvent.startDate = value;
          currentEvent.isAllDay = fullKey.includes('VALUE=DATE') && !fullKey.includes('VALUE=DATE-TIME');
        } else if (key === 'DTEND') {
          currentEvent.endDate = value;
        } else if (key === 'SUMMARY') {
          currentEvent.summary = value;
        } else if (key === 'UID') {
          currentEvent.uid = value;
        } else if (key === 'STATUS') {
          currentEvent.status = value.toUpperCase();
        }
      }
    }
  }
  
  return { events, cancelledCount };
}

function parseDate(dateStr: string): string | null {
  if (!dateStr) return null;
  
  // YYYYMMDD
  if (/^\d{8}$/.test(dateStr)) {
    return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
  }
  // YYYYMMDDTHHMMSSZ or YYYYMMDDTHHMMSS
  if (/^\d{8}T\d{6}Z?$/.test(dateStr)) {
    const d = dateStr.slice(0, 8);
    return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}`;
  }
  // ISO format
  if (dateStr.includes('-')) {
    return dateStr.slice(0, 10);
  }
  return null;
}
