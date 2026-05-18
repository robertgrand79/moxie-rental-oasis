-- Retry policy for scheduled newsletter sends.
--
-- The process-scheduled-newsletters cron worker currently retries a failed
-- dispatch every 5 minutes forever, which can spam Resend (and the admin's
-- logs) if a campaign is permanently broken — e.g. a misconfigured Resend
-- API key, an emailFromAddress that's been removed from the verified-sender
-- list, an oversize body that the v450 guard now rejects. Add an attempt
-- counter and a give-up threshold so persistent failures stop retrying and
-- surface in the UI as "Failed", not "Scheduled".

ALTER TABLE public.newsletter_campaigns
  ADD COLUMN IF NOT EXISTS send_attempts integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_attempt_at timestamptz,
  ADD COLUMN IF NOT EXISTS send_failure_reason text;

-- Backfill existing scheduled rows: zero attempts, no recorded failure.
UPDATE public.newsletter_campaigns
SET send_attempts = 0
WHERE send_attempts IS NULL;
