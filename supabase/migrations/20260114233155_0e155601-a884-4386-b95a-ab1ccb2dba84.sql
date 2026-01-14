-- Create ai_usage table for tracking per-organization AI usage
CREATE TABLE public.ai_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  request_count INTEGER NOT NULL DEFAULT 1,
  tokens_used INTEGER DEFAULT 0,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient lookups
CREATE INDEX idx_ai_usage_org_window ON public.ai_usage(organization_id, window_start);

-- Enable RLS
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

-- RLS policies for ai_usage
CREATE POLICY "Org admins can view their AI usage"
  ON public.ai_usage
  FOR SELECT
  USING (public.user_is_org_admin(auth.uid(), organization_id));

CREATE POLICY "Platform admins can view all AI usage"
  ON public.ai_usage
  FOR SELECT
  USING (public.is_platform_admin());

CREATE POLICY "Service role can manage AI usage"
  ON public.ai_usage
  FOR ALL
  USING (auth.role() = 'service_role');

-- Create function to get organization tier
CREATE OR REPLACE FUNCTION public.get_organization_tier(p_organization_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tier_slug TEXT;
BEGIN
  SELECT st.slug INTO tier_slug
  FROM organizations o
  LEFT JOIN site_templates st ON o.template_id = st.id
  WHERE o.id = p_organization_id;
  
  -- Default to starter if no tier found
  RETURN COALESCE(tier_slug, 'starter');
END;
$$;

-- Create the check_ai_rate_limit function with tier-based limits
CREATE OR REPLACE FUNCTION public.check_ai_rate_limit(
  p_organization_id UUID,
  p_operation_type TEXT DEFAULT 'chat'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  org_tier TEXT;
  daily_limit INTEGER;
  per_minute_limit INTEGER;
  daily_count INTEGER;
  minute_count INTEGER;
  is_allowed BOOLEAN;
  result JSONB;
BEGIN
  -- Get organization tier
  org_tier := get_organization_tier(p_organization_id);
  
  -- Set limits based on tier
  CASE org_tier
    WHEN 'professional' THEN
      daily_limit := 500;
      per_minute_limit := 15;
    WHEN 'portfolio' THEN
      daily_limit := 2000;
      per_minute_limit := 50;
    ELSE -- starter or unknown
      daily_limit := 100;
      per_minute_limit := 5;
  END CASE;
  
  -- Get daily usage count (last 24 hours)
  SELECT COALESCE(SUM(request_count), 0) INTO daily_count
  FROM ai_usage
  WHERE organization_id = p_organization_id
    AND window_start >= now() - interval '24 hours';
  
  -- Get per-minute usage count
  SELECT COALESCE(SUM(request_count), 0) INTO minute_count
  FROM ai_usage
  WHERE organization_id = p_organization_id
    AND window_start >= now() - interval '1 minute';
  
  -- Check if request is allowed
  is_allowed := (daily_count < daily_limit) AND (minute_count < per_minute_limit);
  
  -- If allowed, record the usage
  IF is_allowed THEN
    INSERT INTO ai_usage (organization_id, request_count, window_start)
    VALUES (p_organization_id, 1, now());
  END IF;
  
  -- Build result
  result := jsonb_build_object(
    'allowed', is_allowed,
    'tier', org_tier,
    'daily_limit', daily_limit,
    'daily_used', daily_count + CASE WHEN is_allowed THEN 1 ELSE 0 END,
    'daily_remaining', GREATEST(0, daily_limit - daily_count - CASE WHEN is_allowed THEN 1 ELSE 0 END),
    'per_minute_limit', per_minute_limit,
    'per_minute_used', minute_count + CASE WHEN is_allowed THEN 1 ELSE 0 END,
    'reset_daily', extract(epoch from (now() + interval '24 hours'))::bigint,
    'reset_minute', extract(epoch from (now() + interval '1 minute'))::bigint
  );
  
  RETURN result;
END;
$$;

-- Create function to get current AI usage stats (for dashboard display)
CREATE OR REPLACE FUNCTION public.get_ai_usage_stats(p_organization_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  org_tier TEXT;
  daily_limit INTEGER;
  per_minute_limit INTEGER;
  daily_count INTEGER;
  result JSONB;
BEGIN
  -- Get organization tier
  org_tier := get_organization_tier(p_organization_id);
  
  -- Set limits based on tier
  CASE org_tier
    WHEN 'professional' THEN
      daily_limit := 500;
      per_minute_limit := 15;
    WHEN 'portfolio' THEN
      daily_limit := 2000;
      per_minute_limit := 50;
    ELSE
      daily_limit := 100;
      per_minute_limit := 5;
  END CASE;
  
  -- Get daily usage count
  SELECT COALESCE(SUM(request_count), 0) INTO daily_count
  FROM ai_usage
  WHERE organization_id = p_organization_id
    AND window_start >= now() - interval '24 hours';
  
  result := jsonb_build_object(
    'tier', org_tier,
    'daily_limit', daily_limit,
    'daily_used', daily_count,
    'daily_remaining', GREATEST(0, daily_limit - daily_count),
    'per_minute_limit', per_minute_limit,
    'usage_percentage', ROUND((daily_count::numeric / daily_limit::numeric) * 100, 1)
  );
  
  RETURN result;
END;
$$;

-- Cleanup function to remove old usage records (called by cron)
CREATE OR REPLACE FUNCTION public.cleanup_old_ai_usage()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM ai_usage
  WHERE window_start < now() - interval '7 days';
END;
$$;

-- Add trigger for updated_at
CREATE TRIGGER update_ai_usage_updated_at
  BEFORE UPDATE ON public.ai_usage
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();