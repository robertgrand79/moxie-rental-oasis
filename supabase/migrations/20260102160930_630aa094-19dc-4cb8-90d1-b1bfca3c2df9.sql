-- Add stripe_annual_price_id column for yearly pricing
ALTER TABLE public.site_templates 
ADD COLUMN IF NOT EXISTS stripe_annual_price_id text;

-- Add a comment for clarity
COMMENT ON COLUMN public.site_templates.stripe_price_id IS 'Stripe Price ID for monthly billing';
COMMENT ON COLUMN public.site_templates.stripe_annual_price_id IS 'Stripe Price ID for annual billing';