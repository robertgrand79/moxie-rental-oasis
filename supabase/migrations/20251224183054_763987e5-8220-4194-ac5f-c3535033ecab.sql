-- Remove unused Google Calendar OAuth tables
DROP TABLE IF EXISTS public.google_calendar_events CASCADE;
DROP TABLE IF EXISTS public.google_calendar_sync_settings CASCADE;
DROP TABLE IF EXISTS public.google_calendar_tokens CASCADE;