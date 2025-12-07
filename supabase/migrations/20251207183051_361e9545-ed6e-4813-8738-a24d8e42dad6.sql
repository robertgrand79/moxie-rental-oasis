-- Phase 3: Tenant-Aware Data Access
-- Add helper functions for organization-scoped access through properties

-- Function to check if user can access a property (via organization membership or platform admin)
CREATE OR REPLACE FUNCTION public.can_access_property(_user_id uuid, _property_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    public.is_platform_admin(_user_id)
    OR EXISTS (
      SELECT 1
      FROM public.properties p
      JOIN public.organization_members om ON om.organization_id = p.organization_id
      WHERE p.id = _property_id
        AND om.user_id = _user_id
    )
$$;

-- Function to get a property's organization_id
CREATE OR REPLACE FUNCTION public.get_property_organization_id(_property_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id
  FROM public.properties
  WHERE id = _property_id
  LIMIT 1
$$;

-- Function to check if user can manage a property (org admin/owner or platform admin)
CREATE OR REPLACE FUNCTION public.can_manage_property(_user_id uuid, _property_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    public.is_platform_admin(_user_id)
    OR EXISTS (
      SELECT 1
      FROM public.properties p
      JOIN public.organization_members om ON om.organization_id = p.organization_id
      WHERE p.id = _property_id
        AND om.user_id = _user_id
        AND om.role IN ('admin', 'owner')
    )
$$;

-- Function to check organization access (membership or platform admin)
CREATE OR REPLACE FUNCTION public.can_access_organization(_user_id uuid, _org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    public.is_platform_admin(_user_id)
    OR public.user_belongs_to_organization(_user_id, _org_id)
$$;

-- Function to check organization management (org admin/owner or platform admin)
CREATE OR REPLACE FUNCTION public.can_manage_organization(_user_id uuid, _org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    public.is_platform_admin(_user_id)
    OR public.user_is_org_admin(_user_id, _org_id)
$$;

-- ============================================================
-- UPDATE RLS POLICIES FOR PROPERTIES
-- ============================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Organization members can view their properties" ON public.properties;
DROP POLICY IF EXISTS "Organization admins can manage properties" ON public.properties;
DROP POLICY IF EXISTS "Platform admins can manage all properties" ON public.properties;
DROP POLICY IF EXISTS "Admins can manage properties" ON public.properties;
DROP POLICY IF EXISTS "Anyone can view active properties" ON public.properties;
DROP POLICY IF EXISTS "Public can view published properties" ON public.properties;

-- Create new organization-scoped policies (properties are always viewable publicly)
CREATE POLICY "Public can view properties"
ON public.properties
FOR SELECT
USING (true);

CREATE POLICY "Organization admins can manage properties"
ON public.properties
FOR ALL
USING (
  public.can_manage_organization(auth.uid(), organization_id)
);

-- ============================================================
-- UPDATE RLS POLICIES FOR SITE_SETTINGS
-- ============================================================

DROP POLICY IF EXISTS "Organization members can view their site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Organization admins can manage site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Platform admins can manage all site settings" ON public.site_settings;
DROP POLICY IF EXISTS "Admins can update settings" ON public.site_settings;
DROP POLICY IF EXISTS "Public can view settings" ON public.site_settings;

CREATE POLICY "Public can view site settings"
ON public.site_settings
FOR SELECT
USING (true);

CREATE POLICY "Organization admins can manage site settings"
ON public.site_settings
FOR ALL
USING (
  public.can_manage_organization(auth.uid(), organization_id)
);

-- ============================================================
-- UPDATE RLS POLICIES FOR WORK_ORDERS
-- ============================================================

DROP POLICY IF EXISTS "Admins can manage all work orders" ON public.work_orders;
DROP POLICY IF EXISTS "Contractors can view assigned work orders" ON public.work_orders;
DROP POLICY IF EXISTS "Organization members can view their work orders" ON public.work_orders;
DROP POLICY IF EXISTS "Organization admins can manage work orders" ON public.work_orders;

CREATE POLICY "Organization members can view their work orders"
ON public.work_orders
FOR SELECT
USING (
  public.can_access_organization(auth.uid(), organization_id)
  OR (
    contractor_id IN (
      SELECT id FROM public.contractors 
      WHERE email = (SELECT email FROM public.profiles WHERE id = auth.uid())
    )
  )
);

CREATE POLICY "Organization admins can manage work orders"
ON public.work_orders
FOR ALL
USING (
  public.can_manage_organization(auth.uid(), organization_id)
);

-- ============================================================
-- UPDATE RLS POLICIES FOR AVAILABILITY_BLOCKS
-- ============================================================

DROP POLICY IF EXISTS "Admins can manage availability blocks" ON public.availability_blocks;

CREATE POLICY "Public can view availability"
ON public.availability_blocks
FOR SELECT
USING (true);

CREATE POLICY "Organization admins can manage availability blocks"
ON public.availability_blocks
FOR ALL
USING (
  public.can_manage_property(auth.uid(), property_id)
);

-- ============================================================
-- UPDATE RLS POLICIES FOR DYNAMIC_PRICING
-- ============================================================

DROP POLICY IF EXISTS "Admins can manage dynamic pricing" ON public.dynamic_pricing;

CREATE POLICY "Public can view pricing"
ON public.dynamic_pricing
FOR SELECT
USING (true);

CREATE POLICY "Organization admins can manage dynamic pricing"
ON public.dynamic_pricing
FOR ALL
USING (
  public.can_manage_property(auth.uid(), property_id)
);

-- ============================================================
-- UPDATE RLS POLICIES FOR EXTERNAL_CALENDARS
-- ============================================================

DROP POLICY IF EXISTS "Admins can manage external calendars" ON public.external_calendars;

CREATE POLICY "Organization members can view external calendars"
ON public.external_calendars
FOR SELECT
USING (
  public.can_access_property(auth.uid(), property_id)
);

CREATE POLICY "Organization admins can manage external calendars"
ON public.external_calendars
FOR ALL
USING (
  public.can_manage_property(auth.uid(), property_id)
);

-- ============================================================
-- UPDATE RLS POLICIES FOR RESERVATIONS
-- ============================================================

DROP POLICY IF EXISTS "Admins can manage all reservations" ON public.reservations;
DROP POLICY IF EXISTS "Public can create reservations" ON public.reservations;
DROP POLICY IF EXISTS "Public can view own reservations" ON public.reservations;

CREATE POLICY "Public can create reservations"
ON public.reservations
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Guests can view their reservations"
ON public.reservations
FOR SELECT
USING (
  guest_email = (SELECT email FROM public.profiles WHERE id = auth.uid())
  OR public.can_access_property(auth.uid(), property_id)
);

CREATE POLICY "Organization admins can manage reservations"
ON public.reservations
FOR ALL
USING (
  public.can_manage_property(auth.uid(), property_id)
);

-- ============================================================
-- UPDATE RLS POLICIES FOR PROPERTY_RESERVATIONS
-- ============================================================

DROP POLICY IF EXISTS "Public can create property reservations" ON public.property_reservations;
DROP POLICY IF EXISTS "Public can view their own property reservations" ON public.property_reservations;
DROP POLICY IF EXISTS "Admins can manage all property reservations" ON public.property_reservations;
DROP POLICY IF EXISTS "Public can view own property reservations by email" ON public.property_reservations;

CREATE POLICY "Public can create property reservations"
ON public.property_reservations
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Public can view property reservations"
ON public.property_reservations
FOR SELECT
USING (true);

CREATE POLICY "Organization admins can manage property reservations"
ON public.property_reservations
FOR ALL
USING (
  public.can_manage_property(auth.uid(), property_id)
);

-- ============================================================
-- UPDATE RLS POLICIES FOR MESSAGE_TEMPLATES
-- ============================================================

DROP POLICY IF EXISTS "Admins can manage message templates" ON public.message_templates;

CREATE POLICY "Organization members can view message templates"
ON public.message_templates
FOR SELECT
USING (
  property_id IS NULL
  OR public.can_access_property(auth.uid(), property_id)
);

CREATE POLICY "Organization admins can manage message templates"
ON public.message_templates
FOR ALL
USING (
  (property_id IS NULL AND public.is_platform_admin(auth.uid()))
  OR public.can_manage_property(auth.uid(), property_id)
);

-- ============================================================
-- UPDATE RLS POLICIES FOR MESSAGING_RULES
-- ============================================================

DROP POLICY IF EXISTS "Admins can manage messaging rules" ON public.messaging_rules;

CREATE POLICY "Organization members can view messaging rules"
ON public.messaging_rules
FOR SELECT
USING (
  property_id IS NULL
  OR public.can_access_property(auth.uid(), property_id)
);

CREATE POLICY "Organization admins can manage messaging rules"
ON public.messaging_rules
FOR ALL
USING (
  (property_id IS NULL AND public.is_platform_admin(auth.uid()))
  OR public.can_manage_property(auth.uid(), property_id)
);

-- ============================================================
-- UPDATE RLS POLICIES FOR GUEST_COMMUNICATIONS
-- ============================================================

DROP POLICY IF EXISTS "Admins can manage guest communications" ON public.guest_communications;

CREATE POLICY "Organization members can view guest communications"
ON public.guest_communications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.property_reservations pr
    WHERE pr.id = guest_communications.reservation_id
    AND public.can_access_property(auth.uid(), pr.property_id)
  )
);

CREATE POLICY "Organization admins can manage guest communications"
ON public.guest_communications
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.property_reservations pr
    WHERE pr.id = guest_communications.reservation_id
    AND public.can_manage_property(auth.uid(), pr.property_id)
  )
);

-- ============================================================
-- UPDATE RLS POLICIES FOR DEVICE_CONFIGURATIONS
-- ============================================================

DROP POLICY IF EXISTS "Admins can manage all device configurations" ON public.device_configurations;
DROP POLICY IF EXISTS "Devices can view their own configuration" ON public.device_configurations;

CREATE POLICY "Devices can view their configuration"
ON public.device_configurations
FOR SELECT
USING (true);

CREATE POLICY "Organization admins can manage device configurations"
ON public.device_configurations
FOR ALL
USING (
  public.can_manage_property(auth.uid(), property_id)
);

-- ============================================================
-- UPDATE RLS POLICIES FOR DEVICE_AUTOMATIONS
-- ============================================================

DROP POLICY IF EXISTS "Admins can manage device automations" ON public.device_automations;

CREATE POLICY "Organization members can view device automations"
ON public.device_automations
FOR SELECT
USING (
  public.can_access_property(auth.uid(), property_id)
);

CREATE POLICY "Organization admins can manage device automations"
ON public.device_automations
FOR ALL
USING (
  public.can_manage_property(auth.uid(), property_id)
);