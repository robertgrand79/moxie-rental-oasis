-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Public can view pricing" ON dynamic_pricing;

-- Create a new policy that only allows organization members to see full pricing details
CREATE POLICY "Org members can view full pricing"
ON dynamic_pricing
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM properties p
    JOIN organization_members om ON om.organization_id = p.organization_id
    WHERE p.id = dynamic_pricing.property_id
    AND om.user_id = auth.uid()
  )
  OR is_platform_admin(auth.uid())
);

-- Create a secure function for public booking that only returns guest-facing price info
CREATE OR REPLACE FUNCTION public.get_public_pricing(
  p_property_id uuid,
  p_start_date date,
  p_end_date date
)
RETURNS TABLE (
  date date,
  final_price numeric,
  min_stay integer,
  checkin_allowed boolean,
  checkout_allowed boolean,
  currency text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    dp.date,
    dp.final_price,
    dp.min_stay,
    dp.checkin_allowed,
    dp.checkout_allowed,
    dp.currency
  FROM dynamic_pricing dp
  WHERE dp.property_id = p_property_id
    AND dp.date >= p_start_date
    AND dp.date <= p_end_date
  ORDER BY dp.date;
$$;