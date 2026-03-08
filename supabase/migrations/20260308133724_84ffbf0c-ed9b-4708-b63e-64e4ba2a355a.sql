
-- =====================================================================
-- ENTERPRISE RLS AUDIT: Consolidate redundant policies on properties,
-- reservations, and property_reservations. Replace nested function
-- chains with direct inline EXISTS subqueries for performance.
-- =====================================================================

-- =====================================================================
-- 1. PROPERTIES TABLE — Consolidate from 8 policies to 4 clean ones
-- =====================================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Anyone can view public property listings" ON public.properties;
DROP POLICY IF EXISTS "Public can view properties" ON public.properties;
DROP POLICY IF EXISTS "Users can view properties in their organization" ON public.properties;
DROP POLICY IF EXISTS "Org admins can manage properties" ON public.properties;
DROP POLICY IF EXISTS "Organization admins can manage properties" ON public.properties;
DROP POLICY IF EXISTS "Authenticated users can insert properties" ON public.properties;
DROP POLICY IF EXISTS "Users can update their own properties" ON public.properties;
DROP POLICY IF EXISTS "Users can delete their own properties" ON public.properties;

-- SELECT: Properties are publicly viewable (guest booking pages need this)
CREATE POLICY "properties_select_public"
  ON public.properties FOR SELECT
  USING (true);

-- INSERT: Org members can insert properties for their org
CREATE POLICY "properties_insert_org_member"
  ON public.properties FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.user_id = auth.uid()
        AND om.organization_id = properties.organization_id
    )
    OR EXISTS (
      SELECT 1 FROM public.platform_admins pa
      WHERE pa.user_id = auth.uid() AND pa.is_active = true
    )
  );

-- UPDATE: Org members (owner/manager/admin) or platform admins
CREATE POLICY "properties_update_org_admin"
  ON public.properties FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.user_id = auth.uid()
        AND om.organization_id = properties.organization_id
        AND om.role IN ('admin', 'owner')
    )
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.platform_admins pa
      WHERE pa.user_id = auth.uid() AND pa.is_active = true
    )
  );

-- DELETE: Org admins/owners or platform admins
CREATE POLICY "properties_delete_org_admin"
  ON public.properties FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.user_id = auth.uid()
        AND om.organization_id = properties.organization_id
        AND om.role IN ('admin', 'owner')
    )
    OR auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.platform_admins pa
      WHERE pa.user_id = auth.uid() AND pa.is_active = true
    )
  );

-- =====================================================================
-- 2. RESERVATIONS TABLE — Consolidate from 9 policies to 5 clean ones
-- =====================================================================

DROP POLICY IF EXISTS "Authenticated users can create reservations" ON public.reservations;
DROP POLICY IF EXISTS "Guests can view their reservations" ON public.reservations;
DROP POLICY IF EXISTS "Org admins can delete reservations" ON public.reservations;
DROP POLICY IF EXISTS "Org admins can manage reservations" ON public.reservations;
DROP POLICY IF EXISTS "Org members can update reservations" ON public.reservations;
DROP POLICY IF EXISTS "Organization admins can manage reservations" ON public.reservations;
DROP POLICY IF EXISTS "Platform admins can view all reservations" ON public.reservations;
DROP POLICY IF EXISTS "Property owners can view reservations for their properties" ON public.reservations;
DROP POLICY IF EXISTS "Users can view their own reservations" ON public.reservations;
DROP POLICY IF EXISTS "Public can create reservations for valid properties" ON public.reservations;

-- SELECT: Org members see their org's reservations, creators see theirs, platform admins see all
CREATE POLICY "reservations_select"
  ON public.reservations FOR SELECT
  USING (
    auth.uid() = created_by
    OR EXISTS (
      SELECT 1 FROM public.properties p
      JOIN public.organization_members om ON om.organization_id = p.organization_id
      WHERE p.id = reservations.property_id
        AND om.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.platform_admins pa
      WHERE pa.user_id = auth.uid() AND pa.is_active = true
    )
  );

-- INSERT: Authenticated users or public with valid property + guest email
CREATE POLICY "reservations_insert"
  ON public.reservations FOR INSERT
  WITH CHECK (
    property_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.properties p WHERE p.id = reservations.property_id
    )
    AND (auth.uid() IS NOT NULL OR guest_email IS NOT NULL)
  );

-- UPDATE: Org members or platform admins
CREATE POLICY "reservations_update"
  ON public.reservations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.properties p
      JOIN public.organization_members om ON om.organization_id = p.organization_id
      WHERE p.id = reservations.property_id
        AND om.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.platform_admins pa
      WHERE pa.user_id = auth.uid() AND pa.is_active = true
    )
  );

-- DELETE: Org admins/owners or platform admins
CREATE POLICY "reservations_delete"
  ON public.reservations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.properties p
      JOIN public.organization_members om ON om.organization_id = p.organization_id
      WHERE p.id = reservations.property_id
        AND om.user_id = auth.uid()
        AND om.role IN ('admin', 'owner')
    )
    OR EXISTS (
      SELECT 1 FROM public.platform_admins pa
      WHERE pa.user_id = auth.uid() AND pa.is_active = true
    )
  );

-- =====================================================================
-- 3. PROPERTY_RESERVATIONS TABLE — Consolidate from 4 to 4 clean ones
-- =====================================================================

DROP POLICY IF EXISTS "Guests can view their own reservations by email" ON public.property_reservations;
DROP POLICY IF EXISTS "Org admins can manage property reservations" ON public.property_reservations;
DROP POLICY IF EXISTS "Organization admins can manage property reservations" ON public.property_reservations;
DROP POLICY IF EXISTS "Public can create reservations with validation" ON public.property_reservations;

-- SELECT: Org members, guest by email, or platform admins
CREATE POLICY "prop_reservations_select"
  ON public.property_reservations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.user_id = auth.uid()
        AND om.organization_id = property_reservations.organization_id
    )
    OR guest_email = (
      SELECT p.email FROM public.profiles p WHERE p.id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.platform_admins pa
      WHERE pa.user_id = auth.uid() AND pa.is_active = true
    )
  );

-- INSERT: Public with valid property
CREATE POLICY "prop_reservations_insert"
  ON public.property_reservations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.properties p WHERE p.id = property_reservations.property_id
    )
    AND (auth.uid() IS NOT NULL OR guest_email IS NOT NULL)
  );

-- UPDATE: Org members or platform admins
CREATE POLICY "prop_reservations_update"
  ON public.property_reservations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.user_id = auth.uid()
        AND om.organization_id = property_reservations.organization_id
    )
    OR EXISTS (
      SELECT 1 FROM public.platform_admins pa
      WHERE pa.user_id = auth.uid() AND pa.is_active = true
    )
  );

-- DELETE: Org admins/owners or platform admins
CREATE POLICY "prop_reservations_delete"
  ON public.property_reservations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members om
      WHERE om.user_id = auth.uid()
        AND om.organization_id = property_reservations.organization_id
        AND om.role IN ('admin', 'owner')
    )
    OR EXISTS (
      SELECT 1 FROM public.platform_admins pa
      WHERE pa.user_id = auth.uid() AND pa.is_active = true
    )
  );

-- =====================================================================
-- 4. Add composite index for RLS performance
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_org_members_user_org_role
  ON public.organization_members (user_id, organization_id, role);
