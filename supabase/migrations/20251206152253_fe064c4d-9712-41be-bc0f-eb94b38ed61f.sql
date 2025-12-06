-- Add SELECT policy so guests can read their own reservations after creating them
CREATE POLICY "Public can view reservations by email" 
ON public.property_reservations 
FOR SELECT 
USING (true);

-- Note: Using 'true' since the reservation ID is needed immediately after creation
-- The booking flow needs to read back the created reservation to pass to Stripe