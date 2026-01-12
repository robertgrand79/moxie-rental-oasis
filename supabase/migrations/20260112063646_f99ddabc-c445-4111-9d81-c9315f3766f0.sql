-- Add subdomain provisioning status columns to organizations table
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS subdomain_status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS subdomain_error text,
ADD COLUMN IF NOT EXISTS cloudflare_hostname_id text;

-- Add comment for documentation
COMMENT ON COLUMN public.organizations.subdomain_status IS 'Status of subdomain SSL provisioning: pending, provisioning, active, failed';
COMMENT ON COLUMN public.organizations.subdomain_error IS 'Error message if subdomain provisioning failed';
COMMENT ON COLUMN public.organizations.cloudflare_hostname_id IS 'Cloudflare custom hostname ID for managing the subdomain';