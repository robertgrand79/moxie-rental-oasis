-- Fix Turno property mapping multi-tenant isolation

-- First, drop existing unique constraint on turno_property_id if it exists
ALTER TABLE turno_property_mapping 
DROP CONSTRAINT IF EXISTS turno_property_mapping_turno_property_id_key;

-- Add composite unique constraint for turno_property_id + organization_id
-- This allows the same Turno property to exist for different organizations
ALTER TABLE turno_property_mapping 
ADD CONSTRAINT turno_property_mapping_turno_org_unique 
UNIQUE (turno_property_id, organization_id);

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Allow authenticated users to read turno property mappings" ON turno_property_mapping;
DROP POLICY IF EXISTS "Allow authenticated users to insert turno property mappings" ON turno_property_mapping;
DROP POLICY IF EXISTS "Allow authenticated users to update turno property mappings" ON turno_property_mapping;
DROP POLICY IF EXISTS "Allow authenticated users to delete turno property mappings" ON turno_property_mapping;
DROP POLICY IF EXISTS "turno_property_mapping_org_isolation" ON turno_property_mapping;
DROP POLICY IF EXISTS "Service role full access to turno_property_mapping" ON turno_property_mapping;

-- Create organization-scoped RLS policies
CREATE POLICY "turno_mapping_select_org_members" ON turno_property_mapping
  FOR SELECT
  USING (
    organization_id IN (
      SELECT om.organization_id FROM organization_members om 
      WHERE om.user_id = auth.uid()
    )
    OR public.is_platform_admin(auth.uid())
  );

CREATE POLICY "turno_mapping_insert_org_members" ON turno_property_mapping
  FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT om.organization_id FROM organization_members om 
      WHERE om.user_id = auth.uid()
    )
    OR public.is_platform_admin(auth.uid())
  );

CREATE POLICY "turno_mapping_update_org_members" ON turno_property_mapping
  FOR UPDATE
  USING (
    organization_id IN (
      SELECT om.organization_id FROM organization_members om 
      WHERE om.user_id = auth.uid()
    )
    OR public.is_platform_admin(auth.uid())
  );

CREATE POLICY "turno_mapping_delete_org_members" ON turno_property_mapping
  FOR DELETE
  USING (
    organization_id IN (
      SELECT om.organization_id FROM organization_members om 
      WHERE om.user_id = auth.uid()
    )
    OR public.is_platform_admin(auth.uid())
  );

-- Service role policy for edge functions
CREATE POLICY "turno_mapping_service_role" ON turno_property_mapping
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Clean up orphaned mappings (those without organization_id)
DELETE FROM turno_property_mapping WHERE organization_id IS NULL;