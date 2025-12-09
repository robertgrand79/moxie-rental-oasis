-- Drop existing policies
DROP POLICY IF EXISTS "Admins can manage guidebooks" ON property_guidebooks;
DROP POLICY IF EXISTS "Anyone can view active guidebooks" ON property_guidebooks;

-- Create organization-scoped policies for property_guidebooks
-- Organization members can view guidebooks for their properties
CREATE POLICY "Organization members can view guidebooks"
ON property_guidebooks
FOR SELECT
USING (
  can_access_property(auth.uid(), property_id)
  OR is_active = true
);

-- Organization admins can manage guidebooks for their properties  
CREATE POLICY "Organization admins can manage guidebooks"
ON property_guidebooks
FOR ALL
USING (can_manage_property(auth.uid(), property_id))
WITH CHECK (can_manage_property(auth.uid(), property_id));