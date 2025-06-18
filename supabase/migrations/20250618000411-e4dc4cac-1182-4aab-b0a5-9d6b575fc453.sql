
-- Create table for storing Google Calendar OAuth tokens
CREATE TABLE google_calendar_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  scope TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for storing synced Google Calendar events
CREATE TABLE google_calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  google_event_id TEXT NOT NULL,
  google_calendar_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  is_all_day BOOLEAN DEFAULT false,
  location TEXT,
  attendees JSONB DEFAULT '[]'::jsonb,
  event_data JSONB NOT NULL,
  last_synced_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, google_event_id)
);

-- Create table for storing Google Calendar sync settings
CREATE TABLE google_calendar_sync_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  google_calendar_id TEXT NOT NULL,
  calendar_name TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  sync_direction TEXT NOT NULL DEFAULT 'both', -- 'import', 'export', 'both'
  sync_task_types TEXT[] DEFAULT '{}',
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, google_calendar_id)
);

-- Add RLS policies
ALTER TABLE google_calendar_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE google_calendar_sync_settings ENABLE ROW LEVEL SECURITY;

-- Policies for google_calendar_tokens
CREATE POLICY "Users can manage their own Google Calendar tokens"
  ON google_calendar_tokens
  FOR ALL
  USING (auth.uid() = user_id);

-- Policies for google_calendar_events
CREATE POLICY "Users can view their own Google Calendar events"
  ON google_calendar_events
  FOR ALL
  USING (auth.uid() = user_id);

-- Policies for google_calendar_sync_settings
CREATE POLICY "Users can manage their own sync settings"
  ON google_calendar_sync_settings
  FOR ALL
  USING (auth.uid() = user_id);

-- Add updated_at triggers
CREATE TRIGGER update_google_calendar_tokens_updated_at
  BEFORE UPDATE ON google_calendar_tokens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_google_calendar_events_updated_at
  BEFORE UPDATE ON google_calendar_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_google_calendar_sync_settings_updated_at
  BEFORE UPDATE ON google_calendar_sync_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
