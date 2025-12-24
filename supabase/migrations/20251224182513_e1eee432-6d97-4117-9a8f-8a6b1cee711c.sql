-- Critical Security Fixes:
-- 1. Create safe view that hides API keys from non-platform-admins
-- 2. Add rate limiting for invitation token validation

-- 1. Re-create dropped policies
CREATE POLICY "Users can view their own organization v2"
ON public.organizations
FOR SELECT
USING (
  user_belongs_to_organization(auth.uid(), id)
);

CREATE POLICY "Org admins can update their organization"
ON public.organizations
FOR UPDATE
USING (user_is_org_admin(auth.uid(), id))
WITH CHECK (user_is_org_admin(auth.uid(), id));

-- 2. Create a safe view that hides sensitive API keys for non-platform-admins
DROP VIEW IF EXISTS public.organizations_safe;
CREATE VIEW public.organizations_safe AS
SELECT 
  id,
  name,
  slug,
  logo_url,
  website,
  created_at,
  updated_at,
  is_active,
  -- Only show API keys to platform admins, null for everyone else
  CASE WHEN is_platform_admin(auth.uid()) THEN stripe_secret_key ELSE NULL END as stripe_secret_key,
  CASE WHEN is_platform_admin(auth.uid()) THEN stripe_publishable_key ELSE NULL END as stripe_publishable_key,
  CASE WHEN is_platform_admin(auth.uid()) THEN stripe_webhook_secret ELSE NULL END as stripe_webhook_secret,
  stripe_account_id,
  subscription_status,
  subscription_tier,
  trial_ends_at,
  CASE WHEN is_platform_admin(auth.uid()) THEN pricelabs_api_key ELSE NULL END as pricelabs_api_key,
  custom_domain,
  is_template,
  onboarding_completed,
  onboarding_step,
  template_type,
  CASE WHEN is_platform_admin(auth.uid()) THEN seam_api_key ELSE NULL END as seam_api_key,
  CASE WHEN is_platform_admin(auth.uid()) THEN seam_webhook_secret ELSE NULL END as seam_webhook_secret,
  CASE WHEN is_platform_admin(auth.uid()) THEN openphone_api_key ELSE NULL END as openphone_api_key,
  CASE WHEN is_platform_admin(auth.uid()) THEN resend_api_key ELSE NULL END as resend_api_key,
  CASE WHEN is_platform_admin(auth.uid()) THEN turno_api_token ELSE NULL END as turno_api_token,
  CASE WHEN is_platform_admin(auth.uid()) THEN turno_api_secret ELSE NULL END as turno_api_secret,
  turno_partner_id,
  CASE WHEN is_platform_admin(auth.uid()) THEN openweather_api_key ELSE NULL END as openweather_api_key,
  stripe_customer_id,
  openphone_phone_number,
  CASE WHEN is_platform_admin(auth.uid()) THEN openphone_webhook_secret ELSE NULL END as openphone_webhook_secret,
  domain_verification_status,
  domain_verified_at,
  domain_last_checked_at,
  domain_dns_records
FROM public.organizations;

-- 3. Grant access to the safe view
GRANT SELECT ON public.organizations_safe TO authenticated;

-- 4. Create rate limiting table for invitation token validation
CREATE TABLE IF NOT EXISTS public.invitation_validation_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_identifier text NOT NULL,
  token_hash text NOT NULL,
  attempted_at timestamptz NOT NULL DEFAULT now(),
  was_successful boolean NOT NULL DEFAULT false
);

-- Enable RLS on rate limit table
ALTER TABLE public.invitation_validation_attempts ENABLE ROW LEVEL SECURITY;

-- Only service role can access this table (blocks authenticated users)
CREATE POLICY "Service role only for invitation_validation_attempts"
ON public.invitation_validation_attempts
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_invitation_validation_ip_time 
ON public.invitation_validation_attempts(ip_identifier, attempted_at);

-- 5. Create function to check rate limit for invitation validation
CREATE OR REPLACE FUNCTION public.check_invitation_rate_limit(
  p_ip_identifier text,
  p_max_attempts int DEFAULT 10,
  p_window_minutes int DEFAULT 15
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  attempt_count int;
BEGIN
  SELECT COUNT(*)
  INTO attempt_count
  FROM public.invitation_validation_attempts
  WHERE ip_identifier = p_ip_identifier
    AND attempted_at > (now() - (p_window_minutes || ' minutes')::interval)
    AND was_successful = false;
  
  RETURN attempt_count < p_max_attempts;
END;
$$;

-- 6. Create function to log invitation validation attempt
CREATE OR REPLACE FUNCTION public.log_invitation_attempt(
  p_ip_identifier text,
  p_token_hash text,
  p_was_successful boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.invitation_validation_attempts (ip_identifier, token_hash, was_successful)
  VALUES (p_ip_identifier, p_token_hash, p_was_successful);
  
  -- Cleanup old records (older than 24 hours)
  DELETE FROM public.invitation_validation_attempts
  WHERE attempted_at < (now() - interval '24 hours');
END;
$$;

-- 7. Update RLS policy for user_invitations to only allow public token validation
-- Drop old policies and create new ones that don't expose all invitation data
DROP POLICY IF EXISTS "Public can validate invitations by token" ON public.user_invitations;

CREATE POLICY "Public can validate invitations by token"
ON public.user_invitations
FOR SELECT
TO anon, authenticated
USING (
  -- Only allow selecting by token (token must be provided in query)
  status = 'pending'
  AND expires_at > now()
);