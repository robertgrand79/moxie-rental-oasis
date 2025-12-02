-- Add min/max price limit columns to dynamic_pricing table
ALTER TABLE public.dynamic_pricing 
ADD COLUMN IF NOT EXISTS min_price_limit numeric,
ADD COLUMN IF NOT EXISTS max_price_limit numeric;

-- Add comment for documentation
COMMENT ON COLUMN public.dynamic_pricing.min_price_limit IS 'Minimum price limit from PriceLabs settings';
COMMENT ON COLUMN public.dynamic_pricing.max_price_limit IS 'Maximum price limit from PriceLabs settings';