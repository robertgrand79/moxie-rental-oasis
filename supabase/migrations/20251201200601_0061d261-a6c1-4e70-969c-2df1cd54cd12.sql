-- Remove Hospitable booking URL column from properties table
ALTER TABLE public.properties DROP COLUMN IF EXISTS hospitable_booking_url;