
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { action, calendar_id, task_data } = await req.json()

    // Get user's Google Calendar tokens
    const { data: tokenData, error: tokenError } = await supabaseClient
      .from('google_calendar_tokens')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (tokenError || !tokenData) {
      return new Response(JSON.stringify({ error: 'No Google Calendar access token found' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check if token needs refresh
    let accessToken = tokenData.access_token
    if (new Date(tokenData.expires_at) <= new Date()) {
      const refreshResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/google-calendar-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': req.headers.get('Authorization')!,
        },
        body: JSON.stringify({
          action: 'refresh_token',
          refresh_token: tokenData.refresh_token,
        }),
      })

      const refreshData = await refreshResponse.json()
      if (refreshData.error) {
        return new Response(JSON.stringify({ error: 'Failed to refresh token' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      accessToken = refreshData.access_token
    }

    if (action === 'import_events') {
      // Import events from Google Calendar
      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendar_id}/events`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      })

      const eventsData = await response.json()

      if (eventsData.error) {
        return new Response(JSON.stringify({ error: eventsData.error }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Store events in database
      const events = eventsData.items || []
      const eventsToInsert = events.map((event: any) => ({
        user_id: user.id,
        google_event_id: event.id,
        google_calendar_id: calendar_id,
        title: event.summary || 'Untitled Event',
        description: event.description,
        start_time: event.start?.dateTime || event.start?.date,
        end_time: event.end?.dateTime || event.end?.date,
        is_all_day: !event.start?.dateTime,
        location: event.location,
        attendees: event.attendees || [],
        event_data: event,
      }))

      const { error: insertError } = await supabaseClient
        .from('google_calendar_events')
        .upsert(eventsToInsert, { onConflict: 'user_id,google_event_id' })

      if (insertError) {
        return new Response(JSON.stringify({ error: insertError.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({ imported: events.length }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'export_task') {
      // Export task to Google Calendar
      const eventData = {
        summary: task_data.title,
        description: task_data.description,
        start: {
          dateTime: task_data.due_date,
          timeZone: 'UTC',
        },
        end: {
          dateTime: new Date(new Date(task_data.due_date).getTime() + 60 * 60 * 1000).toISOString(),
          timeZone: 'UTC',
        },
      }

      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendar_id}/events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      })

      const createdEvent = await response.json()

      if (createdEvent.error) {
        return new Response(JSON.stringify({ error: createdEvent.error }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({ event_id: createdEvent.id }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'list_calendars') {
      // List user's Google Calendars
      const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      })

      const calendarsData = await response.json()

      if (calendarsData.error) {
        return new Response(JSON.stringify({ error: calendarsData.error }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({ calendars: calendarsData.items || [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
