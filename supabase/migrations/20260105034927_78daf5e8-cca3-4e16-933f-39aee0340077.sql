-- Phase 2: Add organization_id to dynamic_pricing and availability_blocks
-- This adds direct organization isolation for performance and defense-in-depth

-- Step 1: Add organization_id columns with foreign keys
ALTER TABLE dynamic_pricing 
ADD COLUMN organization_id UUID REFERENCES organizations(id);

ALTER TABLE availability_blocks 
ADD COLUMN organization_id UUID REFERENCES organizations(id);

-- Step 2: Create indexes for performance
CREATE INDEX idx_dynamic_pricing_org_id ON dynamic_pricing(organization_id);
CREATE INDEX idx_availability_blocks_org_id ON availability_blocks(organization_id);

-- Step 3: Backfill existing data from properties
UPDATE dynamic_pricing dp
SET organization_id = (
  SELECT p.organization_id 
  FROM properties p 
  WHERE p.id = dp.property_id
)
WHERE dp.organization_id IS NULL;

UPDATE availability_blocks ab
SET organization_id = (
  SELECT p.organization_id 
  FROM properties p 
  WHERE p.id = ab.property_id
)
WHERE ab.organization_id IS NULL;

-- Step 4: Create function to auto-set organization_id from property
CREATE OR REPLACE FUNCTION public.set_organization_id_from_property()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.organization_id IS NULL AND NEW.property_id IS NOT NULL THEN
    SELECT organization_id INTO NEW.organization_id
    FROM public.properties WHERE id = NEW.property_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Step 5: Create triggers for both tables
CREATE TRIGGER set_dynamic_pricing_org_id
  BEFORE INSERT ON dynamic_pricing
  FOR EACH ROW
  EXECUTE FUNCTION set_organization_id_from_property();

CREATE TRIGGER set_availability_blocks_org_id
  BEFORE INSERT ON availability_blocks
  FOR EACH ROW
  EXECUTE FUNCTION set_organization_id_from_property();

-- Step 6: Update RLS policies for dynamic_pricing
DROP POLICY IF EXISTS "Org members can view full pricing" ON dynamic_pricing;
DROP POLICY IF EXISTS "Organization admins can manage dynamic pricing" ON dynamic_pricing;

CREATE POLICY "Org members can view pricing"
ON dynamic_pricing FOR SELECT
USING (
  public.user_belongs_to_organization(auth.uid(), organization_id)
  OR public.is_platform_admin(auth.uid())
);

CREATE POLICY "Org admins can manage pricing"
ON dynamic_pricing FOR ALL
USING (
  public.can_manage_property(auth.uid(), property_id)
  OR public.is_platform_admin(auth.uid())
);

-- Step 7: Update RLS policies for availability_blocks
DROP POLICY IF EXISTS "Public can view availability" ON availability_blocks;
DROP POLICY IF EXISTS "Organization admins can manage availability blocks" ON availability_blocks;

-- Keep public SELECT for guest booking availability checks
CREATE POLICY "Public can view availability for booking"
ON availability_blocks FOR SELECT
USING (true);

CREATE POLICY "Org admins can manage availability"
ON availability_blocks FOR ALL
USING (
  public.can_manage_property(auth.uid(), property_id)
  OR public.is_platform_admin(auth.uid())
);