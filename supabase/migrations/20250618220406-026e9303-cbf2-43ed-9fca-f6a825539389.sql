
-- Make price_per_night optional in the properties table
ALTER TABLE public.properties 
ALTER COLUMN price_per_night DROP NOT NULL;
