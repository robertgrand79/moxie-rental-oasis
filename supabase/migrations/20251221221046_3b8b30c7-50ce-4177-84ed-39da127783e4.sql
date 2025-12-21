-- FIX #1: Tighten profiles RLS - users should only see their own profile unless admin
-- Drop overly permissive policies
DROP POLICY IF EXISTS "Org members can view org member profiles" ON public.profiles;
DROP POLICY IF EXISTS "Organization admins can view member profiles" ON public.profiles;

-- Create a more restrictive policy for viewing profiles
-- Admins can view all, org admins can view members (but limited fields handled at app level)
CREATE POLICY "Users can only view their own profile or admins can view all"
ON public.profiles FOR SELECT
USING (
  auth.uid() = id  -- Users can see their own profile
  OR is_admin()    -- Platform admins can see all
  OR is_platform_admin(auth.uid())  -- Platform admins
);

-- FIX #2: Tighten property_access_details - only show during actual stay, not before
-- First, let's check and update the existing policy
DROP POLICY IF EXISTS "Guests can view access details for their reservations" ON public.property_access_details;

-- Create stricter policy - only show access details from check-in date (not before)
CREATE POLICY "Guests can view access details during their stay only"
ON public.property_access_details FOR SELECT
USING (
  -- Property managers/admins can always view
  can_manage_property(auth.uid(), property_id)
  OR
  -- Guests can only view during their actual stay period (check-in day to check-out day)
  EXISTS (
    SELECT 1 FROM property_reservations pr
    WHERE pr.property_id = property_access_details.property_id
      AND pr.guest_email = (SELECT email FROM profiles WHERE id = auth.uid())
      AND pr.booking_status IN ('confirmed', 'checked_in')
      AND CURRENT_DATE >= pr.check_in_date  -- Only from check-in day
      AND CURRENT_DATE <= pr.check_out_date  -- Until check-out day
  )
);