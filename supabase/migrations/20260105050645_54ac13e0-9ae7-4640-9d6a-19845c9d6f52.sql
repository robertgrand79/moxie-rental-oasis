-- Phase 5: Fix security definer view issue
-- Recreate organizations_safe view with explicit SECURITY INVOKER
-- This ensures RLS policies of the querying user are enforced, not the view owner

DROP VIEW IF EXISTS public.organizations_safe;

CREATE VIEW public.organizations_safe
WITH (security_invoker = true)
AS
SELECT 
    id,
    name,
    slug,
    logo_url,
    website,
    created_at,
    updated_at,
    is_active,
    (stripe_secret_key IS NOT NULL AND stripe_secret_key <> '') AS has_stripe_configured,
    (stripe_publishable_key IS NOT NULL AND stripe_publishable_key <> '') AS has_stripe_publishable_configured,
    (stripe_webhook_secret IS NOT NULL AND stripe_webhook_secret <> '') AS has_stripe_webhook_configured,
    stripe_account_id,
    subscription_status,
    subscription_tier,
    trial_ends_at,
    (pricelabs_api_key IS NOT NULL AND pricelabs_api_key <> '') AS has_pricelabs_configured,
    custom_domain,
    is_template,
    onboarding_completed,
    onboarding_step,
    template_type,
    (seam_api_key IS NOT NULL AND seam_api_key <> '') AS has_seam_configured,
    (openphone_api_key IS NOT NULL AND openphone_api_key <> '') AS has_openphone_configured,
    (resend_api_key IS NOT NULL AND resend_api_key <> '') AS has_resend_configured,
    (turno_api_token IS NOT NULL AND turno_api_token <> '') AS has_turno_configured,
    turno_partner_id,
    (openweather_api_key IS NOT NULL AND openweather_api_key <> '') AS has_openweather_configured,
    stripe_customer_id,
    openphone_phone_number,
    domain_verification_status,
    domain_verified_at,
    domain_last_checked_at,
    domain_dns_records
FROM organizations;

-- Grant appropriate permissions
GRANT SELECT ON public.organizations_safe TO authenticated;
GRANT SELECT ON public.organizations_safe TO anon;