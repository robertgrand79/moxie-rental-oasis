-- Phase 2: Add organization_id to Office Module Tables

-- 1. Add organization_id to office_spaces
ALTER TABLE office_spaces ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
CREATE INDEX IF NOT EXISTS idx_office_spaces_org ON office_spaces(organization_id);

-- 2. Add organization_id to office_rentals
ALTER TABLE office_rentals ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
CREATE INDEX IF NOT EXISTS idx_office_rentals_org ON office_rentals(organization_id);

-- 3. Add organization_id to office_assignments
ALTER TABLE office_assignments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
CREATE INDEX IF NOT EXISTS idx_office_assignments_org ON office_assignments(organization_id);

-- 4. Add organization_id to booking_charges (via reservation)
ALTER TABLE booking_charges ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
CREATE INDEX IF NOT EXISTS idx_booking_charges_org ON booking_charges(organization_id);

-- Backfill office_spaces from created_by profile
UPDATE office_spaces os
SET organization_id = (
  SELECT om.organization_id FROM organization_members om 
  WHERE om.user_id = os.created_by 
  LIMIT 1
)
WHERE os.organization_id IS NULL AND os.created_by IS NOT NULL;

-- Backfill office_rentals from user_id profile
UPDATE office_rentals orl
SET organization_id = (
  SELECT om.organization_id FROM organization_members om 
  WHERE om.user_id = orl.user_id 
  LIMIT 1
)
WHERE orl.organization_id IS NULL AND orl.user_id IS NOT NULL;

-- Backfill office_assignments from user_id profile
UPDATE office_assignments oa
SET organization_id = (
  SELECT om.organization_id FROM organization_members om 
  WHERE om.user_id = oa.user_id 
  LIMIT 1
)
WHERE oa.organization_id IS NULL AND oa.user_id IS NOT NULL;

-- Backfill booking_charges from reservation
UPDATE booking_charges bc
SET organization_id = (
  SELECT r.organization_id FROM reservations r 
  WHERE r.id = bc.reservation_id
)
WHERE bc.organization_id IS NULL AND bc.reservation_id IS NOT NULL;

-- Create trigger function for office_spaces
CREATE OR REPLACE FUNCTION set_office_spaces_org_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.organization_id IS NULL AND NEW.created_by IS NOT NULL THEN
    SELECT om.organization_id INTO NEW.organization_id
    FROM organization_members om
    WHERE om.user_id = NEW.created_by
    LIMIT 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER set_office_spaces_org_id_trigger
  BEFORE INSERT ON office_spaces
  FOR EACH ROW EXECUTE FUNCTION set_office_spaces_org_id();

-- Create trigger function for office_rentals
CREATE OR REPLACE FUNCTION set_office_rentals_org_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.organization_id IS NULL AND NEW.user_id IS NOT NULL THEN
    SELECT om.organization_id INTO NEW.organization_id
    FROM organization_members om
    WHERE om.user_id = NEW.user_id
    LIMIT 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER set_office_rentals_org_id_trigger
  BEFORE INSERT ON office_rentals
  FOR EACH ROW EXECUTE FUNCTION set_office_rentals_org_id();

-- Create trigger function for office_assignments
CREATE OR REPLACE FUNCTION set_office_assignments_org_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.organization_id IS NULL AND NEW.user_id IS NOT NULL THEN
    SELECT om.organization_id INTO NEW.organization_id
    FROM organization_members om
    WHERE om.user_id = NEW.user_id
    LIMIT 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER set_office_assignments_org_id_trigger
  BEFORE INSERT ON office_assignments
  FOR EACH ROW EXECUTE FUNCTION set_office_assignments_org_id();

-- Create trigger function for booking_charges
CREATE OR REPLACE FUNCTION set_booking_charges_org_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.organization_id IS NULL AND NEW.reservation_id IS NOT NULL THEN
    SELECT r.organization_id INTO NEW.organization_id
    FROM reservations r
    WHERE r.id = NEW.reservation_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER set_booking_charges_org_id_trigger
  BEFORE INSERT ON booking_charges
  FOR EACH ROW EXECUTE FUNCTION set_booking_charges_org_id();

-- RLS Policies for office_spaces
ALTER TABLE office_spaces ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members can view office spaces" ON office_spaces;
CREATE POLICY "Org members can view office spaces" ON office_spaces
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
    OR public.is_platform_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Org admins can manage office spaces" ON office_spaces;
CREATE POLICY "Org admins can manage office spaces" ON office_spaces
  FOR ALL USING (
    public.user_is_org_admin(auth.uid(), organization_id)
    OR public.is_platform_admin(auth.uid())
  );

-- RLS Policies for office_rentals
ALTER TABLE office_rentals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members can view office rentals" ON office_rentals;
CREATE POLICY "Org members can view office rentals" ON office_rentals
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
    OR public.is_platform_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Org admins can manage office rentals" ON office_rentals;
CREATE POLICY "Org admins can manage office rentals" ON office_rentals
  FOR ALL USING (
    public.user_is_org_admin(auth.uid(), organization_id)
    OR public.is_platform_admin(auth.uid())
  );

-- RLS Policies for office_assignments
ALTER TABLE office_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members can view office assignments" ON office_assignments;
CREATE POLICY "Org members can view office assignments" ON office_assignments
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
    OR public.is_platform_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Org admins can manage office assignments" ON office_assignments;
CREATE POLICY "Org admins can manage office assignments" ON office_assignments
  FOR ALL USING (
    public.user_is_org_admin(auth.uid(), organization_id)
    OR public.is_platform_admin(auth.uid())
  );

-- RLS Policies for booking_charges
ALTER TABLE booking_charges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Org members can view booking charges" ON booking_charges;
CREATE POLICY "Org members can view booking charges" ON booking_charges
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
    OR public.is_platform_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Org admins can manage booking charges" ON booking_charges;
CREATE POLICY "Org admins can manage booking charges" ON booking_charges
  FOR ALL USING (
    public.user_is_org_admin(auth.uid(), organization_id)
    OR public.is_platform_admin(auth.uid())
  );