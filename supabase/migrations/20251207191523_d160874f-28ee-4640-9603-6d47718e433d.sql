-- Add API key columns to organizations table for multi-tenant support
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS seam_api_key text;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS seam_webhook_secret text;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS openphone_api_key text;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS resend_api_key text;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS turno_api_token text;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS turno_api_secret text;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS turno_partner_id text;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS apify_api_key text;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS openweather_api_key text;

-- Add comments for documentation
COMMENT ON COLUMN organizations.seam_api_key IS 'SEAM smart lock API key for this organization';
COMMENT ON COLUMN organizations.seam_webhook_secret IS 'SEAM webhook secret for verifying callbacks';
COMMENT ON COLUMN organizations.openphone_api_key IS 'OpenPhone API key for SMS communications';
COMMENT ON COLUMN organizations.resend_api_key IS 'Resend API key for email communications';
COMMENT ON COLUMN organizations.turno_api_token IS 'Turno API token for cleaning service integration';
COMMENT ON COLUMN organizations.turno_api_secret IS 'Turno API secret for cleaning service integration';
COMMENT ON COLUMN organizations.turno_partner_id IS 'Turno partner ID for cleaning service integration';
COMMENT ON COLUMN organizations.apify_api_key IS 'Apify API key for web scraping (Airbnb reviews)';
COMMENT ON COLUMN organizations.openweather_api_key IS 'OpenWeather API key for weather data';