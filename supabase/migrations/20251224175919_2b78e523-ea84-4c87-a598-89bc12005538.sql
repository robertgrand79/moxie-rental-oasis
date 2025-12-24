-- Fix property_reservations policy without status check

-- Drop if exists and recreate
DROP POLICY IF EXISTS "Public can create reservations with validation" ON public.property_reservations;

-- Public reservation creation requires valid property and guest info
CREATE POLICY "Public can create reservations with validation"
ON public.property_reservations
FOR INSERT
WITH CHECK (
  -- Property must exist
  EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = property_id
  )
  -- And guest email must be provided for unauthenticated users
  AND (auth.uid() IS NOT NULL OR guest_email IS NOT NULL)
);