-- Add hospitable_price column to dynamic_pricing table
ALTER TABLE public.dynamic_pricing 
ADD COLUMN IF NOT EXISTS hospitable_price numeric NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.dynamic_pricing.hospitable_price IS 'Price fetched from Hospitable API';