-- Phase 1: Add organization_id to message_templates and messaging_rules
-- This fixes multi-tenant isolation for global templates/rules

-- Step 1: Add organization_id columns
ALTER TABLE message_templates 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

ALTER TABLE messaging_rules 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);

-- Step 2: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_message_templates_org ON message_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_messaging_rules_org ON messaging_rules(organization_id);

-- Step 3: Backfill message_templates from property's organization
UPDATE message_templates 
SET organization_id = (
  SELECT p.organization_id 
  FROM properties p 
  WHERE p.id = message_templates.property_id
)
WHERE property_id IS NOT NULL AND organization_id IS NULL;

-- Backfill orphaned message_templates (global templates) from creator's organization
UPDATE message_templates 
SET organization_id = (
  SELECT om.organization_id 
  FROM organization_members om 
  WHERE om.user_id = message_templates.created_by 
  LIMIT 1
)
WHERE property_id IS NULL AND organization_id IS NULL AND created_by IS NOT NULL;

-- Step 4: Backfill messaging_rules from property's organization
UPDATE messaging_rules 
SET organization_id = (
  SELECT p.organization_id 
  FROM properties p 
  WHERE p.id = messaging_rules.property_id
)
WHERE property_id IS NOT NULL AND organization_id IS NULL;

-- Backfill orphaned messaging_rules (global rules) from creator's organization
UPDATE messaging_rules 
SET organization_id = (
  SELECT om.organization_id 
  FROM organization_members om 
  WHERE om.user_id = messaging_rules.created_by 
  LIMIT 1
)
WHERE property_id IS NULL AND organization_id IS NULL AND created_by IS NOT NULL;

-- Step 5: Drop existing RLS policies for message_templates
DROP POLICY IF EXISTS "Public can view active templates" ON message_templates;
DROP POLICY IF EXISTS "Organization members can view message templates" ON message_templates;
DROP POLICY IF EXISTS "Organization admins can manage message templates" ON message_templates;
DROP POLICY IF EXISTS "Users can create templates" ON message_templates;
DROP POLICY IF EXISTS "Users can update templates" ON message_templates;
DROP POLICY IF EXISTS "Users can delete templates" ON message_templates;

-- Step 6: Create new organization-scoped RLS policies for message_templates
CREATE POLICY "Users can view templates in their org"
ON message_templates FOR SELECT
USING (
  organization_id IS NOT NULL AND (
    user_belongs_to_organization(auth.uid(), organization_id)
    OR is_platform_admin()
  )
);

CREATE POLICY "Users can insert templates in their org"
ON message_templates FOR INSERT
WITH CHECK (
  organization_id IS NOT NULL AND (
    user_belongs_to_organization(auth.uid(), organization_id)
    OR is_platform_admin()
  )
);

CREATE POLICY "Users can update templates in their org"
ON message_templates FOR UPDATE
USING (
  organization_id IS NOT NULL AND (
    user_belongs_to_organization(auth.uid(), organization_id)
    OR is_platform_admin()
  )
);

CREATE POLICY "Users can delete templates in their org"
ON message_templates FOR DELETE
USING (
  organization_id IS NOT NULL AND (
    user_belongs_to_organization(auth.uid(), organization_id)
    OR is_platform_admin()
  )
);

-- Step 7: Drop existing RLS policies for messaging_rules
DROP POLICY IF EXISTS "Organization members can view messaging rules" ON messaging_rules;
DROP POLICY IF EXISTS "Organization admins can manage messaging rules" ON messaging_rules;
DROP POLICY IF EXISTS "Users can create rules" ON messaging_rules;
DROP POLICY IF EXISTS "Users can update rules" ON messaging_rules;
DROP POLICY IF EXISTS "Users can delete rules" ON messaging_rules;

-- Step 8: Create new organization-scoped RLS policies for messaging_rules
CREATE POLICY "Users can view rules in their org"
ON messaging_rules FOR SELECT
USING (
  organization_id IS NOT NULL AND (
    user_belongs_to_organization(auth.uid(), organization_id)
    OR is_platform_admin()
  )
);

CREATE POLICY "Users can insert rules in their org"
ON messaging_rules FOR INSERT
WITH CHECK (
  organization_id IS NOT NULL AND (
    user_belongs_to_organization(auth.uid(), organization_id)
    OR is_platform_admin()
  )
);

CREATE POLICY "Users can update rules in their org"
ON messaging_rules FOR UPDATE
USING (
  organization_id IS NOT NULL AND (
    user_belongs_to_organization(auth.uid(), organization_id)
    OR is_platform_admin()
  )
);

CREATE POLICY "Users can delete rules in their org"
ON messaging_rules FOR DELETE
USING (
  organization_id IS NOT NULL AND (
    user_belongs_to_organization(auth.uid(), organization_id)
    OR is_platform_admin()
  )
);