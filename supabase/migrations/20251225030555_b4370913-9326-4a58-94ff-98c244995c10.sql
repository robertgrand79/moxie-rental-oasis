-- Drop and recreate organizations_safe view with boolean flags instead of API keys
DROP VIEW IF EXISTS organizations_safe;

CREATE VIEW organizations_safe AS
SELECT 
    id,
    name,
    slug,
    logo_url,
    website,
    created_at,
    updated_at,
    is_active,
    -- Replace API key columns with boolean flags
    (stripe_secret_key IS NOT NULL AND stripe_secret_key != '') AS has_stripe_configured,
    (stripe_publishable_key IS NOT NULL AND stripe_publishable_key != '') AS has_stripe_publishable_configured,
    (stripe_webhook_secret IS NOT NULL AND stripe_webhook_secret != '') AS has_stripe_webhook_configured,
    stripe_account_id,
    subscription_status,
    subscription_tier,
    trial_ends_at,
    (pricelabs_api_key IS NOT NULL AND pricelabs_api_key != '') AS has_pricelabs_configured,
    custom_domain,
    is_template,
    onboarding_completed,
    onboarding_step,
    template_type,
    (seam_api_key IS NOT NULL AND seam_api_key != '') AS has_seam_configured,
    (openphone_api_key IS NOT NULL AND openphone_api_key != '') AS has_openphone_configured,
    (resend_api_key IS NOT NULL AND resend_api_key != '') AS has_resend_configured,
    (turno_api_token IS NOT NULL AND turno_api_token != '') AS has_turno_configured,
    turno_partner_id,
    (openweather_api_key IS NOT NULL AND openweather_api_key != '') AS has_openweather_configured,
    stripe_customer_id,
    openphone_phone_number,
    domain_verification_status,
    domain_verified_at,
    domain_last_checked_at,
    domain_dns_records
FROM organizations;

-- Add comment to document the view purpose
COMMENT ON VIEW organizations_safe IS 'Safe view of organizations that exposes only boolean flags for API key configuration status, never the actual keys. Use edge functions (get-org-api-key, set-org-api-key) for secure key access.';