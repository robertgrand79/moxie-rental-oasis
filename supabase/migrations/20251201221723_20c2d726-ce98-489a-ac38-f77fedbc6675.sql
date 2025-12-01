-- Remove Hospitable columns from database

-- Drop hospitable_property_id from properties table
ALTER TABLE public.properties DROP COLUMN IF EXISTS hospitable_property_id;

-- Drop hospitable_price from dynamic_pricing table
ALTER TABLE public.dynamic_pricing DROP COLUMN IF EXISTS hospitable_price;