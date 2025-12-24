-- Create account lockout tracking table
CREATE TABLE IF NOT EXISTS public.account_lockouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMP WITH TIME ZONE,
  last_failed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(email)
);

-- Enable RLS
ALTER TABLE public.account_lockouts ENABLE ROW LEVEL SECURITY;

-- Only service role can access this table (no policies = only service role)
-- This is intentional for security

-- Create function to track failed login attempts (called from edge function or auth hook)
CREATE OR REPLACE FUNCTION public.track_failed_login(p_email TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lockout RECORD;
  v_max_attempts INTEGER := 5;
  v_lockout_duration INTERVAL := '15 minutes';
  v_is_locked BOOLEAN := false;
  v_remaining_attempts INTEGER;
  v_locked_until TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Check if there's an existing lockout record
  SELECT * INTO v_lockout FROM account_lockouts WHERE email = lower(p_email);
  
  IF v_lockout IS NOT NULL THEN
    -- Check if currently locked
    IF v_lockout.locked_until IS NOT NULL AND v_lockout.locked_until > now() THEN
      RETURN json_build_object(
        'is_locked', true,
        'locked_until', v_lockout.locked_until,
        'message', 'Account temporarily locked. Try again later.'
      );
    END IF;
    
    -- If lock has expired, reset the counter or increment
    IF v_lockout.locked_until IS NOT NULL AND v_lockout.locked_until <= now() THEN
      -- Reset after lock expired
      UPDATE account_lockouts 
      SET failed_attempts = 1, locked_until = NULL, last_failed_at = now(), updated_at = now()
      WHERE email = lower(p_email);
      v_remaining_attempts := v_max_attempts - 1;
    ELSE
      -- Increment failed attempts
      UPDATE account_lockouts 
      SET failed_attempts = failed_attempts + 1, last_failed_at = now(), updated_at = now()
      WHERE email = lower(p_email)
      RETURNING failed_attempts INTO v_lockout.failed_attempts;
      
      v_remaining_attempts := v_max_attempts - v_lockout.failed_attempts;
      
      -- Lock if max attempts reached
      IF v_lockout.failed_attempts >= v_max_attempts THEN
        v_locked_until := now() + v_lockout_duration;
        UPDATE account_lockouts 
        SET locked_until = v_locked_until, updated_at = now()
        WHERE email = lower(p_email);
        v_is_locked := true;
      END IF;
    END IF;
  ELSE
    -- First failed attempt
    INSERT INTO account_lockouts (email, failed_attempts, last_failed_at)
    VALUES (lower(p_email), 1, now());
    v_remaining_attempts := v_max_attempts - 1;
  END IF;
  
  RETURN json_build_object(
    'is_locked', v_is_locked,
    'locked_until', v_locked_until,
    'remaining_attempts', GREATEST(0, v_remaining_attempts),
    'message', CASE 
      WHEN v_is_locked THEN 'Too many failed attempts. Account locked for 15 minutes.'
      WHEN v_remaining_attempts <= 2 THEN format('%s attempts remaining before lockout', v_remaining_attempts)
      ELSE NULL
    END
  );
END;
$$;

-- Create function to clear failed login tracking on successful login
CREATE OR REPLACE FUNCTION public.clear_failed_logins(p_email TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM account_lockouts WHERE email = lower(p_email);
END;
$$;

-- Create function to check if account is locked
CREATE OR REPLACE FUNCTION public.check_account_lockout(p_email TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lockout RECORD;
BEGIN
  SELECT * INTO v_lockout FROM account_lockouts WHERE email = lower(p_email);
  
  IF v_lockout IS NULL THEN
    RETURN json_build_object('is_locked', false);
  END IF;
  
  IF v_lockout.locked_until IS NOT NULL AND v_lockout.locked_until > now() THEN
    RETURN json_build_object(
      'is_locked', true,
      'locked_until', v_lockout.locked_until,
      'message', 'Account temporarily locked due to too many failed login attempts.'
    );
  END IF;
  
  RETURN json_build_object('is_locked', false);
END;
$$;

-- Grant execute to authenticated and anon for checking lockout
GRANT EXECUTE ON FUNCTION public.check_account_lockout(TEXT) TO authenticated, anon;

-- Add index for fast lookups
CREATE INDEX IF NOT EXISTS idx_account_lockouts_email ON public.account_lockouts(email);