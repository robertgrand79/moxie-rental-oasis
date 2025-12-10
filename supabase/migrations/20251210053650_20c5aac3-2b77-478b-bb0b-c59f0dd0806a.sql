-- Fix: Remove overly permissive public SELECT policies on property_reservations
-- These policies expose all guest data publicly

DROP POLICY IF EXISTS "Public can view property reservations" ON public.property_reservations;
DROP POLICY IF EXISTS "Public can view reservations by email" ON public.property_reservations;

-- Also clean up duplicate INSERT policies
DROP POLICY IF EXISTS "Public can create property reservations" ON public.property_reservations;
DROP POLICY IF EXISTS "Public can create reservations" ON public.property_reservations;
DROP POLICY IF EXISTS "Public can create reservations with validation" ON public.property_reservations;

-- Create a single validated INSERT policy
CREATE POLICY "Public can create reservations with validation" 
ON public.property_reservations 
FOR INSERT 
WITH CHECK (
  guest_email IS NOT NULL 
  AND guest_email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND guest_name IS NOT NULL
  AND LENGTH(TRIM(guest_name)) > 0
  AND property_id IS NOT NULL
);