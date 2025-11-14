-- Create airbnb_sync_log table to track sync history
CREATE TABLE IF NOT EXISTS airbnb_sync_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  sync_status TEXT NOT NULL DEFAULT 'pending',
  reviews_found INTEGER DEFAULT 0,
  reviews_imported INTEGER DEFAULT 0,
  last_sync_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  next_sync_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_airbnb_sync_log_property_id ON airbnb_sync_log(property_id);
CREATE INDEX idx_airbnb_sync_log_last_sync_at ON airbnb_sync_log(last_sync_at DESC);

-- Enable RLS
ALTER TABLE airbnb_sync_log ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admins can view sync logs"
  ON airbnb_sync_log FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "System can insert sync logs"
  ON airbnb_sync_log FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "System can update sync logs"
  ON airbnb_sync_log FOR UPDATE
  TO authenticated
  USING (true);

-- Setup pg_cron for daily Airbnb sync at 2 AM UTC
SELECT cron.schedule(
  'airbnb-daily-sync',
  '0 2 * * *',
  $$
  SELECT net.http_post(
    url := 'https://joiovubyokikqjytxtuv.supabase.co/functions/v1/scheduled-airbnb-sync',
    headers := jsonb_build_object(
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvaW92dWJ5b2tpa3FqeXR4dHV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyNDc2OTQsImV4cCI6MjA2NDgyMzY5NH0.cSinlIK2dbTx_oYXJRyxB6kZKbqBJ6iM3jKR2JSfIIM',
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);