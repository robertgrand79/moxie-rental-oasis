-- Fix search_path warnings for functions that don't have it set
-- These functions need search_path set to prevent SQL injection

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix update_device_config_updated_at function
CREATE OR REPLACE FUNCTION public.update_device_config_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Fix set_publish_at_on_publish function
CREATE OR REPLACE FUNCTION public.set_publish_at_on_publish()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.status = 'published' AND NEW.publish_at IS NULL THEN
    NEW.publish_at := now();
  END IF;
  RETURN NEW;
END;
$function$;

-- Fix log_device_config_changes function
CREATE OR REPLACE FUNCTION public.log_device_config_changes()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO public.configuration_audit_log (
      device_id,
      property_id,
      action,
      old_config,
      new_config,
      details
    ) VALUES (
      NEW.device_id,
      NEW.property_id,
      'configuration_updated',
      to_jsonb(OLD),
      to_jsonb(NEW),
      jsonb_build_object('trigger', 'automatic', 'timestamp', now())
    );
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.configuration_audit_log (
      device_id,
      property_id,
      action,
      new_config,
      details
    ) VALUES (
      NEW.device_id,
      NEW.property_id,
      'device_registered',
      to_jsonb(NEW),
      jsonb_build_object('trigger', 'automatic', 'timestamp', now())
    );
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$function$;

-- Create enhanced rate limiting table
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  identifier TEXT NOT NULL,
  operation_type TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on rate_limits table
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Create policy for rate limits
CREATE POLICY "System can manage rate limits" ON public.rate_limits
FOR ALL USING (true);

-- Create index for efficient rate limit queries
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier_operation 
ON public.rate_limits(identifier, operation_type);

-- Update rate limiting function to use proper database storage
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  operation_type text, 
  identifier text, 
  max_requests integer DEFAULT 10, 
  window_minutes integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
  current_count integer;
  window_start timestamp with time zone;
BEGIN
  window_start := now() - (window_minutes || ' minutes')::interval;
  
  -- Clean up old entries
  DELETE FROM public.rate_limits 
  WHERE window_start < (now() - interval '24 hours');
  
  -- Get current count for this identifier and operation
  SELECT COALESCE(SUM(request_count), 0) 
  INTO current_count
  FROM public.rate_limits 
  WHERE rate_limits.identifier = check_rate_limit.identifier 
    AND rate_limits.operation_type = check_rate_limit.operation_type
    AND window_start >= (now() - (window_minutes || ' minutes')::interval);
  
  -- Check if limit exceeded
  IF current_count >= max_requests THEN
    RETURN false;
  END IF;
  
  -- Add new request record
  INSERT INTO public.rate_limits (identifier, operation_type, request_count, window_start)
  VALUES (check_rate_limit.identifier, check_rate_limit.operation_type, 1, now())
  ON CONFLICT (identifier, operation_type) 
  DO UPDATE SET 
    request_count = rate_limits.request_count + 1,
    updated_at = now();
  
  RETURN true;
END;
$function$;

-- Create security audit table for enhanced logging
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id UUID,
  ip_address TEXT,
  user_agent TEXT,
  resource TEXT,
  action TEXT,
  details JSONB DEFAULT '{}',
  risk_level TEXT DEFAULT 'low',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on security audit logs
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for security audit logs
CREATE POLICY "Admins can view security audit logs" ON public.security_audit_logs
FOR SELECT USING (is_admin());

CREATE POLICY "System can insert security audit logs" ON public.security_audit_logs
FOR INSERT WITH CHECK (true);