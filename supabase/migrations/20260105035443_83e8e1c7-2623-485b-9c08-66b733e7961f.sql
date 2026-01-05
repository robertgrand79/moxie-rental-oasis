-- Phase 3: Add organization_id to medium-priority property-related tables
-- Tables: testimonials, property_checklist_runs, property_checklist_item_completions,
-- external_calendars, property_fees, device_automations, device_configurations,
-- seam_devices, seam_access_codes, pricing_rules, length_of_stay_discounts,
-- property_guidebooks, property_access_details, tasks

-- ============================================
-- STEP 1: Add organization_id columns
-- ============================================

-- Batch 3A: High-Traffic Property Tables
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
ALTER TABLE property_checklist_runs ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
ALTER TABLE property_checklist_item_completions ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
ALTER TABLE external_calendars ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
ALTER TABLE property_fees ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- Batch 3B: Smart Home & Device Tables
ALTER TABLE device_automations ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
ALTER TABLE device_configurations ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
ALTER TABLE seam_devices ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
ALTER TABLE seam_access_codes ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- Batch 3C: Pricing & Booking Tables
ALTER TABLE pricing_rules ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
ALTER TABLE length_of_stay_discounts ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
ALTER TABLE property_guidebooks ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- Batch 3D: Property Supporting Tables
ALTER TABLE property_access_details ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- ============================================
-- STEP 2: Create indexes for performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_testimonials_org_id ON testimonials(organization_id);
CREATE INDEX IF NOT EXISTS idx_property_checklist_runs_org_id ON property_checklist_runs(organization_id);
CREATE INDEX IF NOT EXISTS idx_property_checklist_item_completions_org_id ON property_checklist_item_completions(organization_id);
CREATE INDEX IF NOT EXISTS idx_external_calendars_org_id ON external_calendars(organization_id);
CREATE INDEX IF NOT EXISTS idx_property_fees_org_id ON property_fees(organization_id);
CREATE INDEX IF NOT EXISTS idx_device_automations_org_id ON device_automations(organization_id);
CREATE INDEX IF NOT EXISTS idx_device_configurations_org_id ON device_configurations(organization_id);
CREATE INDEX IF NOT EXISTS idx_seam_devices_org_id ON seam_devices(organization_id);
CREATE INDEX IF NOT EXISTS idx_seam_access_codes_org_id ON seam_access_codes(organization_id);
CREATE INDEX IF NOT EXISTS idx_pricing_rules_org_id ON pricing_rules(organization_id);
CREATE INDEX IF NOT EXISTS idx_length_of_stay_discounts_org_id ON length_of_stay_discounts(organization_id);
CREATE INDEX IF NOT EXISTS idx_property_guidebooks_org_id ON property_guidebooks(organization_id);
CREATE INDEX IF NOT EXISTS idx_property_access_details_org_id ON property_access_details(organization_id);
CREATE INDEX IF NOT EXISTS idx_tasks_org_id ON tasks(organization_id);

-- ============================================
-- STEP 3: Backfill existing data
-- ============================================

-- Backfill testimonials (21 rows) - handle both property_id and created_by paths
UPDATE testimonials t
SET organization_id = COALESCE(
  (SELECT p.organization_id FROM properties p WHERE p.id = t.property_id),
  (SELECT pr.organization_id FROM profiles pr WHERE pr.id = t.created_by)
)
WHERE t.organization_id IS NULL;

-- Backfill external_calendars from property
UPDATE external_calendars ec
SET organization_id = (SELECT p.organization_id FROM properties p WHERE p.id = ec.property_id)
WHERE ec.organization_id IS NULL AND ec.property_id IS NOT NULL;

-- Backfill property_fees from property
UPDATE property_fees pf
SET organization_id = (SELECT p.organization_id FROM properties p WHERE p.id = pf.property_id)
WHERE pf.organization_id IS NULL AND pf.property_id IS NOT NULL;

-- Backfill device_automations from property
UPDATE device_automations da
SET organization_id = (SELECT p.organization_id FROM properties p WHERE p.id = da.property_id)
WHERE da.organization_id IS NULL AND da.property_id IS NOT NULL;

-- Backfill device_configurations from property
UPDATE device_configurations dc
SET organization_id = (SELECT p.organization_id FROM properties p WHERE p.id = dc.property_id)
WHERE dc.organization_id IS NULL AND dc.property_id IS NOT NULL;

-- Backfill seam_devices from property
UPDATE seam_devices sd
SET organization_id = (SELECT p.organization_id FROM properties p WHERE p.id = sd.property_id)
WHERE sd.organization_id IS NULL AND sd.property_id IS NOT NULL;

-- Backfill seam_access_codes from device -> property path
UPDATE seam_access_codes sac
SET organization_id = (
  SELECT p.organization_id 
  FROM seam_devices sd 
  JOIN properties p ON p.id = sd.property_id 
  WHERE sd.id = sac.device_id
)
WHERE sac.organization_id IS NULL AND sac.device_id IS NOT NULL;

-- Backfill pricing_rules from property
UPDATE pricing_rules pr
SET organization_id = (SELECT p.organization_id FROM properties p WHERE p.id = pr.property_id)
WHERE pr.organization_id IS NULL AND pr.property_id IS NOT NULL;

-- Backfill length_of_stay_discounts from property
UPDATE length_of_stay_discounts lsd
SET organization_id = (SELECT p.organization_id FROM properties p WHERE p.id = lsd.property_id)
WHERE lsd.organization_id IS NULL AND lsd.property_id IS NOT NULL;

-- Backfill property_guidebooks from property
UPDATE property_guidebooks pg
SET organization_id = (SELECT p.organization_id FROM properties p WHERE p.id = pg.property_id)
WHERE pg.organization_id IS NULL AND pg.property_id IS NOT NULL;

-- Backfill property_access_details from property
UPDATE property_access_details pad
SET organization_id = (SELECT p.organization_id FROM properties p WHERE p.id = pad.property_id)
WHERE pad.organization_id IS NULL AND pad.property_id IS NOT NULL;

-- Backfill tasks from property (fallback to created_by)
UPDATE tasks t
SET organization_id = COALESCE(
  (SELECT p.organization_id FROM properties p WHERE p.id = t.property_id),
  (SELECT pr.organization_id FROM profiles pr WHERE pr.id = t.created_by)
)
WHERE t.organization_id IS NULL;

-- Backfill property_checklist_runs from property
UPDATE property_checklist_runs pcr
SET organization_id = (SELECT p.organization_id FROM properties p WHERE p.id = pcr.property_id)
WHERE pcr.organization_id IS NULL AND pcr.property_id IS NOT NULL;

-- Backfill property_checklist_item_completions from run
UPDATE property_checklist_item_completions pcic
SET organization_id = (SELECT pcr.organization_id FROM property_checklist_runs pcr WHERE pcr.id = pcic.run_id)
WHERE pcic.organization_id IS NULL AND pcic.run_id IS NOT NULL;

-- ============================================
-- STEP 4: Create triggers for auto-population
-- ============================================

-- Reuse set_organization_id_from_property() function from Phase 2

-- Create triggers for tables with property_id
CREATE TRIGGER set_testimonials_org_id
  BEFORE INSERT ON testimonials
  FOR EACH ROW
  EXECUTE FUNCTION set_organization_id_from_property();

CREATE TRIGGER set_property_checklist_runs_org_id
  BEFORE INSERT ON property_checklist_runs
  FOR EACH ROW
  EXECUTE FUNCTION set_organization_id_from_property();

CREATE TRIGGER set_external_calendars_org_id
  BEFORE INSERT ON external_calendars
  FOR EACH ROW
  EXECUTE FUNCTION set_organization_id_from_property();

CREATE TRIGGER set_property_fees_org_id
  BEFORE INSERT ON property_fees
  FOR EACH ROW
  EXECUTE FUNCTION set_organization_id_from_property();

CREATE TRIGGER set_device_automations_org_id
  BEFORE INSERT ON device_automations
  FOR EACH ROW
  EXECUTE FUNCTION set_organization_id_from_property();

CREATE TRIGGER set_device_configurations_org_id
  BEFORE INSERT ON device_configurations
  FOR EACH ROW
  EXECUTE FUNCTION set_organization_id_from_property();

CREATE TRIGGER set_seam_devices_org_id
  BEFORE INSERT ON seam_devices
  FOR EACH ROW
  EXECUTE FUNCTION set_organization_id_from_property();

CREATE TRIGGER set_pricing_rules_org_id
  BEFORE INSERT ON pricing_rules
  FOR EACH ROW
  EXECUTE FUNCTION set_organization_id_from_property();

CREATE TRIGGER set_length_of_stay_discounts_org_id
  BEFORE INSERT ON length_of_stay_discounts
  FOR EACH ROW
  EXECUTE FUNCTION set_organization_id_from_property();

CREATE TRIGGER set_property_guidebooks_org_id
  BEFORE INSERT ON property_guidebooks
  FOR EACH ROW
  EXECUTE FUNCTION set_organization_id_from_property();

CREATE TRIGGER set_property_access_details_org_id
  BEFORE INSERT ON property_access_details
  FOR EACH ROW
  EXECUTE FUNCTION set_organization_id_from_property();

CREATE TRIGGER set_tasks_org_id
  BEFORE INSERT ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION set_organization_id_from_property();

-- Special trigger for property_checklist_item_completions (derives from run_id)
CREATE OR REPLACE FUNCTION set_organization_id_from_checklist_run()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.organization_id IS NULL AND NEW.run_id IS NOT NULL THEN
    SELECT organization_id INTO NEW.organization_id
    FROM property_checklist_runs WHERE id = NEW.run_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_property_checklist_item_completions_org_id
  BEFORE INSERT ON property_checklist_item_completions
  FOR EACH ROW
  EXECUTE FUNCTION set_organization_id_from_checklist_run();

-- Special trigger for seam_access_codes (derives from device_id -> property)
CREATE OR REPLACE FUNCTION set_organization_id_from_seam_device()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.organization_id IS NULL AND NEW.device_id IS NOT NULL THEN
    SELECT p.organization_id INTO NEW.organization_id
    FROM seam_devices sd
    JOIN properties p ON p.id = sd.property_id
    WHERE sd.id = NEW.device_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_seam_access_codes_org_id
  BEFORE INSERT ON seam_access_codes
  FOR EACH ROW
  EXECUTE FUNCTION set_organization_id_from_seam_device();

-- ============================================
-- STEP 5: Update RLS policies
-- ============================================

-- Testimonials policies
DROP POLICY IF EXISTS "Organization members can view testimonials" ON testimonials;
DROP POLICY IF EXISTS "Organization admins can manage testimonials" ON testimonials;

CREATE POLICY "Org members can view testimonials"
ON testimonials FOR SELECT
USING (
  organization_id IS NULL 
  OR user_belongs_to_organization(auth.uid(), organization_id)
  OR is_platform_admin(auth.uid())
);

CREATE POLICY "Org admins can manage testimonials"
ON testimonials FOR ALL
USING (
  can_manage_property(auth.uid(), property_id)
  OR is_platform_admin(auth.uid())
);

-- Property Checklist Runs policies
DROP POLICY IF EXISTS "Organization members can view checklist runs" ON property_checklist_runs;
DROP POLICY IF EXISTS "Organization admins can manage checklist runs" ON property_checklist_runs;

CREATE POLICY "Org members can view checklist runs"
ON property_checklist_runs FOR SELECT
USING (
  user_belongs_to_organization(auth.uid(), organization_id)
  OR is_platform_admin(auth.uid())
);

CREATE POLICY "Org admins can manage checklist runs"
ON property_checklist_runs FOR ALL
USING (
  can_manage_property(auth.uid(), property_id)
  OR is_platform_admin(auth.uid())
);

-- Property Checklist Item Completions policies
DROP POLICY IF EXISTS "Organization members can view completions" ON property_checklist_item_completions;
DROP POLICY IF EXISTS "Organization admins can manage completions" ON property_checklist_item_completions;

CREATE POLICY "Org members can view completions"
ON property_checklist_item_completions FOR SELECT
USING (
  user_belongs_to_organization(auth.uid(), organization_id)
  OR is_platform_admin(auth.uid())
);

CREATE POLICY "Org admins can manage completions"
ON property_checklist_item_completions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM property_checklist_runs pcr
    WHERE pcr.id = property_checklist_item_completions.run_id
    AND can_manage_property(auth.uid(), pcr.property_id)
  )
  OR is_platform_admin(auth.uid())
);

-- External Calendars policies
DROP POLICY IF EXISTS "Organization members can view calendars" ON external_calendars;
DROP POLICY IF EXISTS "Organization admins can manage calendars" ON external_calendars;

CREATE POLICY "Org members can view calendars"
ON external_calendars FOR SELECT
USING (
  user_belongs_to_organization(auth.uid(), organization_id)
  OR is_platform_admin(auth.uid())
);

CREATE POLICY "Org admins can manage calendars"
ON external_calendars FOR ALL
USING (
  can_manage_property(auth.uid(), property_id)
  OR is_platform_admin(auth.uid())
);

-- Property Fees policies
DROP POLICY IF EXISTS "Organization members can view fees" ON property_fees;
DROP POLICY IF EXISTS "Organization admins can manage fees" ON property_fees;

CREATE POLICY "Org members can view fees"
ON property_fees FOR SELECT
USING (
  user_belongs_to_organization(auth.uid(), organization_id)
  OR is_platform_admin(auth.uid())
);

CREATE POLICY "Org admins can manage fees"
ON property_fees FOR ALL
USING (
  can_manage_property(auth.uid(), property_id)
  OR is_platform_admin(auth.uid())
);

-- Device Automations policies
DROP POLICY IF EXISTS "Organization members can view automations" ON device_automations;
DROP POLICY IF EXISTS "Organization admins can manage automations" ON device_automations;

CREATE POLICY "Org members can view automations"
ON device_automations FOR SELECT
USING (
  user_belongs_to_organization(auth.uid(), organization_id)
  OR is_platform_admin(auth.uid())
);

CREATE POLICY "Org admins can manage automations"
ON device_automations FOR ALL
USING (
  can_manage_property(auth.uid(), property_id)
  OR is_platform_admin(auth.uid())
);

-- Device Configurations policies
DROP POLICY IF EXISTS "Organization members can view configurations" ON device_configurations;
DROP POLICY IF EXISTS "Organization admins can manage configurations" ON device_configurations;

CREATE POLICY "Org members can view configurations"
ON device_configurations FOR SELECT
USING (
  user_belongs_to_organization(auth.uid(), organization_id)
  OR is_platform_admin(auth.uid())
);

CREATE POLICY "Org admins can manage configurations"
ON device_configurations FOR ALL
USING (
  can_manage_property(auth.uid(), property_id)
  OR is_platform_admin(auth.uid())
);

-- Seam Devices policies
DROP POLICY IF EXISTS "Organization members can view seam devices" ON seam_devices;
DROP POLICY IF EXISTS "Organization admins can manage seam devices" ON seam_devices;

CREATE POLICY "Org members can view seam devices"
ON seam_devices FOR SELECT
USING (
  user_belongs_to_organization(auth.uid(), organization_id)
  OR is_platform_admin(auth.uid())
);

CREATE POLICY "Org admins can manage seam devices"
ON seam_devices FOR ALL
USING (
  can_manage_property(auth.uid(), property_id)
  OR is_platform_admin(auth.uid())
);

-- Seam Access Codes policies
DROP POLICY IF EXISTS "Organization members can view access codes" ON seam_access_codes;
DROP POLICY IF EXISTS "Organization admins can manage access codes" ON seam_access_codes;

CREATE POLICY "Org members can view access codes"
ON seam_access_codes FOR SELECT
USING (
  user_belongs_to_organization(auth.uid(), organization_id)
  OR is_platform_admin(auth.uid())
);

CREATE POLICY "Org admins can manage access codes"
ON seam_access_codes FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM seam_devices sd
    WHERE sd.id = seam_access_codes.device_id
    AND can_manage_property(auth.uid(), sd.property_id)
  )
  OR is_platform_admin(auth.uid())
);

-- Pricing Rules policies
DROP POLICY IF EXISTS "Organization members can view pricing rules" ON pricing_rules;
DROP POLICY IF EXISTS "Organization admins can manage pricing rules" ON pricing_rules;

CREATE POLICY "Org members can view pricing rules"
ON pricing_rules FOR SELECT
USING (
  user_belongs_to_organization(auth.uid(), organization_id)
  OR is_platform_admin(auth.uid())
);

CREATE POLICY "Org admins can manage pricing rules"
ON pricing_rules FOR ALL
USING (
  can_manage_property(auth.uid(), property_id)
  OR is_platform_admin(auth.uid())
);

-- Length of Stay Discounts policies
DROP POLICY IF EXISTS "Organization members can view discounts" ON length_of_stay_discounts;
DROP POLICY IF EXISTS "Organization admins can manage discounts" ON length_of_stay_discounts;

CREATE POLICY "Org members can view discounts"
ON length_of_stay_discounts FOR SELECT
USING (
  user_belongs_to_organization(auth.uid(), organization_id)
  OR is_platform_admin(auth.uid())
);

CREATE POLICY "Org admins can manage discounts"
ON length_of_stay_discounts FOR ALL
USING (
  can_manage_property(auth.uid(), property_id)
  OR is_platform_admin(auth.uid())
);

-- Property Guidebooks policies
DROP POLICY IF EXISTS "Organization members can view guidebooks" ON property_guidebooks;
DROP POLICY IF EXISTS "Organization admins can manage guidebooks" ON property_guidebooks;

CREATE POLICY "Org members can view guidebooks"
ON property_guidebooks FOR SELECT
USING (
  user_belongs_to_organization(auth.uid(), organization_id)
  OR is_platform_admin(auth.uid())
);

CREATE POLICY "Org admins can manage guidebooks"
ON property_guidebooks FOR ALL
USING (
  can_manage_property(auth.uid(), property_id)
  OR is_platform_admin(auth.uid())
);

-- Property Access Details policies (keep public SELECT for guest portal)
DROP POLICY IF EXISTS "Public can view access details" ON property_access_details;
DROP POLICY IF EXISTS "Organization admins can manage access details" ON property_access_details;

CREATE POLICY "Public can view access details"
ON property_access_details FOR SELECT
USING (true);

CREATE POLICY "Org admins can manage access details"
ON property_access_details FOR ALL
USING (
  can_manage_property(auth.uid(), property_id)
  OR is_platform_admin(auth.uid())
);

-- Tasks policies
DROP POLICY IF EXISTS "Organization members can view tasks" ON tasks;
DROP POLICY IF EXISTS "Organization admins can manage tasks" ON tasks;

CREATE POLICY "Org members can view tasks"
ON tasks FOR SELECT
USING (
  user_belongs_to_organization(auth.uid(), organization_id)
  OR is_platform_admin(auth.uid())
);

CREATE POLICY "Org admins can manage tasks"
ON tasks FOR ALL
USING (
  (property_id IS NOT NULL AND can_manage_property(auth.uid(), property_id))
  OR (property_id IS NULL AND user_belongs_to_organization(auth.uid(), organization_id))
  OR is_platform_admin(auth.uid())
);