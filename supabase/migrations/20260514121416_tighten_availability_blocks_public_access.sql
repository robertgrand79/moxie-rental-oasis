-- Replace the open public SELECT on availability_blocks with a function-based interface.
-- Public callers must now request a specific set of property IDs and a date range; the
-- function returns only minimal fields (property_id, start_date, end_date) for booked/blocked
-- ranges that overlap the requested window. Internal columns (notes, external_booking_id,
-- source_platform, guest_count, etc.) are no longer reachable by anon callers.
--
-- Admin/org access continues to work via the existing "Org admins can manage availability"
-- policy, which uses can_manage_property to scope by the caller's auth.uid().

DROP POLICY IF EXISTS "Public can view availability for booking" ON public.availability_blocks;

CREATE OR REPLACE FUNCTION public.get_blocked_dates(
  p_property_ids uuid[],
  p_start_date date,
  p_end_date date
)
RETURNS TABLE(property_id uuid, blocked_start date, blocked_end date)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT property_id, start_date, end_date
  FROM public.availability_blocks
  WHERE property_id = ANY(p_property_ids)
    AND block_type IN ('booked', 'blocked')
    AND start_date <= p_end_date
    AND end_date >= p_start_date;
$$;

REVOKE ALL ON FUNCTION public.get_blocked_dates(uuid[], date, date) FROM public;
GRANT EXECUTE ON FUNCTION public.get_blocked_dates(uuid[], date, date) TO anon, authenticated;

COMMENT ON FUNCTION public.get_blocked_dates IS
  'Public booking flow: returns booked/blocked date ranges for the requested properties and window. Replaces the previous open RLS policy on availability_blocks. Exposes only property_id and date range — no notes, guest info, or external booking IDs.';
