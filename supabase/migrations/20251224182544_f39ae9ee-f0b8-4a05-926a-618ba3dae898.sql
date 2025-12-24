-- Fix the security definer view warning by explicitly setting SECURITY INVOKER
-- This ensures the view respects the querying user's permissions

DROP VIEW IF EXISTS public.organizations_safe;

CREATE VIEW public.organizations_safe 
WITH (security_invoker = on) AS
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

-- Re-grant access
GRANT SELECT ON public.organizations_safe TO authenticated;