-- Drop and recreate the view with all needed non-secret columns
DROP VIEW IF EXISTS public.organizations_safe CASCADE;

CREATE VIEW public.organizations_safe AS
SELECT 
  id, name, slug, logo_url, website,
  created_at, updated_at, is_active,
  template_type, is_template, custom_domain,
  onboarding_completed, onboarding_step,
  subscription_status, subscription_tier, trial_ends_at,
  stripe_account_id, stripe_customer_id,
  stripe_connect_id, stripe_connect_status,
  payments_enabled, platform_fee_percent,
  turno_partner_id,
  openphone_phone_number,
  domain_verification_status, domain_verified_at,
  domain_last_checked_at, domain_dns_records,
  created_from_template_id, is_template_source, template_category,
  archived_at, archived_by, archive_reason,
  subdomain_status, subdomain_error, cloudflare_hostname_id,
  active_template_slug, inbound_email_prefix,
  is_comped, comped_tier, comped_until, comped_by, comped_at, comp_notes,
  discount_percent, discount_notes, discount_set_by, discount_set_at, stripe_coupon_id,
  -- Boolean flags for configured integrations (safe to expose)
  (stripe_secret_key IS NOT NULL AND stripe_secret_key <> '') AS has_stripe_configured,
  (stripe_publishable_key IS NOT NULL AND stripe_publishable_key <> '') AS has_stripe_publishable_configured,
  (stripe_webhook_secret IS NOT NULL AND stripe_webhook_secret <> '') AS has_stripe_webhook_configured,
  (pricelabs_api_key IS NOT NULL AND pricelabs_api_key <> '') AS has_pricelabs_configured,
  (seam_api_key IS NOT NULL AND seam_api_key <> '') AS has_seam_configured,
  (openphone_api_key IS NOT NULL AND openphone_api_key <> '') AS has_openphone_configured,
  (resend_api_key IS NOT NULL AND resend_api_key <> '') AS has_resend_configured,
  (turno_api_token IS NOT NULL AND turno_api_token <> '') AS has_turno_configured,
  (openweather_api_key IS NOT NULL AND openweather_api_key <> '') AS has_openweather_configured
FROM organizations;

-- Grant access to the safe view  
GRANT SELECT ON public.organizations_safe TO anon, authenticated;

-- Revoke SELECT access on sensitive API key columns from authenticated and anon roles
REVOKE SELECT (stripe_secret_key) ON public.organizations FROM anon, authenticated;
REVOKE SELECT (stripe_publishable_key) ON public.organizations FROM anon, authenticated;
REVOKE SELECT (stripe_webhook_secret) ON public.organizations FROM anon, authenticated;
REVOKE SELECT (seam_api_key) ON public.organizations FROM anon, authenticated;
REVOKE SELECT (seam_webhook_secret) ON public.organizations FROM anon, authenticated;
REVOKE SELECT (openphone_api_key) ON public.organizations FROM anon, authenticated;
REVOKE SELECT (openphone_webhook_secret) ON public.organizations FROM anon, authenticated;
REVOKE SELECT (resend_api_key) ON public.organizations FROM anon, authenticated;
REVOKE SELECT (pricelabs_api_key) ON public.organizations FROM anon, authenticated;
REVOKE SELECT (turno_api_token) ON public.organizations FROM anon, authenticated;
REVOKE SELECT (turno_api_secret) ON public.organizations FROM anon, authenticated;
REVOKE SELECT (openweather_api_key) ON public.organizations FROM anon, authenticated;