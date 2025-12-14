-- Add OpenPhone webhook configuration columns to organizations table
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS openphone_phone_number text,
ADD COLUMN IF NOT EXISTS openphone_webhook_secret text;

-- Add comment for documentation
COMMENT ON COLUMN public.organizations.openphone_phone_number IS 'The OpenPhone phone number used by this organization for SMS';
COMMENT ON COLUMN public.organizations.openphone_webhook_secret IS 'Secret for verifying OpenPhone webhook authenticity (optional)';