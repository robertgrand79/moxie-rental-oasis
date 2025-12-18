-- Drop the airbnb sync cron job if it exists
SELECT cron.unschedule('airbnb-review-sync-daily') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'airbnb-review-sync-daily'
);

-- Drop the airbnb_sync_log table
DROP TABLE IF EXISTS public.airbnb_sync_log CASCADE;