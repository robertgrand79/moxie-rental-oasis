-- Add per-user digest timezone and send hour preferences
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS digest_timezone text NOT NULL DEFAULT 'America/Los_Angeles',
ADD COLUMN IF NOT EXISTS digest_send_hour integer NOT NULL DEFAULT 7,
ADD COLUMN IF NOT EXISTS digest_send_minute integer NOT NULL DEFAULT 30;

-- Add constraint for valid hour/minute
ALTER TABLE public.profiles 
ADD CONSTRAINT check_digest_hour CHECK (digest_send_hour >= 0 AND digest_send_hour <= 23),
ADD CONSTRAINT check_digest_minute CHECK (digest_send_minute >= 0 AND digest_send_minute <= 59);