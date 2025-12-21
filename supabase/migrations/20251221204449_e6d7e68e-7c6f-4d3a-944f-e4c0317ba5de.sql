-- Add guest access policy for property_access_details
-- The first two policies were already created, just add the guest policy with correct column name

CREATE POLICY "Guests can view access details for active reservations"
ON public.property_access_details
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM property_reservations pr
    WHERE pr.property_id = property_access_details.property_id
    AND pr.guest_email = (SELECT email FROM profiles WHERE id = auth.uid())
    AND pr.booking_status IN ('confirmed', 'checked_in')
    AND pr.check_in_date <= CURRENT_DATE + INTERVAL '1 day'
    AND pr.check_out_date >= CURRENT_DATE
  )
);