-- Create a secure function for guests to look up their own reservation
-- Uses reservation ID + email to prevent enumeration attacks
CREATE OR REPLACE FUNCTION public.get_reservation_by_id_and_email(
  p_reservation_id UUID,
  p_guest_email TEXT
)
RETURNS TABLE (
  id UUID,
  property_id UUID,
  guest_name TEXT,
  check_in_date DATE,
  check_out_date DATE,
  guest_count INTEGER,
  total_amount NUMERIC,
  booking_status TEXT,
  payment_status TEXT,
  special_requests TEXT,
  check_in_instructions TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    pr.id,
    pr.property_id,
    pr.guest_name,
    pr.check_in_date,
    pr.check_out_date,
    pr.guest_count,
    pr.total_amount,
    pr.booking_status,
    pr.payment_status,
    pr.special_requests,
    pr.check_in_instructions,
    pr.created_at
  FROM public.property_reservations pr
  WHERE pr.id = p_reservation_id
    AND LOWER(pr.guest_email) = LOWER(p_guest_email)
  LIMIT 1;
$$;

-- Grant execute to anon and authenticated for guest lookups
GRANT EXECUTE ON FUNCTION public.get_reservation_by_id_and_email(UUID, TEXT) TO anon, authenticated;