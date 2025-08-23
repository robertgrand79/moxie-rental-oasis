-- Add booking_platform field to testimonials table
ALTER TABLE public.testimonials 
ADD COLUMN booking_platform text;

-- Add constraint to ensure valid platform values
ALTER TABLE public.testimonials
ADD CONSTRAINT testimonials_booking_platform_check 
CHECK (booking_platform IN ('direct', 'airbnb', 'vrbo') OR booking_platform IS NULL);