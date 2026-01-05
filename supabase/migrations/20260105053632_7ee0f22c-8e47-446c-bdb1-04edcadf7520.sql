-- Phase 6B: Clean up remaining legacy is_admin() policies
-- These policies have different naming patterns than initially targeted

-- ========================================
-- maintenance_checklist_items - has organization_id directly
-- ========================================
DROP POLICY IF EXISTS "Users can delete items in their templates" ON public.maintenance_checklist_items;
DROP POLICY IF EXISTS "Users can insert items in their templates" ON public.maintenance_checklist_items;
DROP POLICY IF EXISTS "Users can update items in their templates" ON public.maintenance_checklist_items;

-- Create proper org-scoped policies for maintenance_checklist_items
CREATE POLICY "Org members can manage checklist items"
ON public.maintenance_checklist_items FOR ALL TO authenticated
USING (
  public.is_platform_admin(auth.uid())
  OR public.user_belongs_to_organization(auth.uid(), organization_id)
)
WITH CHECK (
  public.is_platform_admin(auth.uid())
  OR public.user_belongs_to_organization(auth.uid(), organization_id)
);

-- ========================================
-- newsletter_subscribers - remaining legacy policies
-- ========================================
DROP POLICY IF EXISTS "Admins can insert subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Admins can update subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Only admins can update newsletter subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Admins can delete subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Admins can view all subscribers" ON public.newsletter_subscribers;
DROP POLICY IF EXISTS "Only admins can delete newsletter subscribers" ON public.newsletter_subscribers;

-- ========================================
-- office_rentals - remaining legacy policies
-- ========================================
DROP POLICY IF EXISTS "Admins can update all rentals" ON public.office_rentals;
DROP POLICY IF EXISTS "Admins can view all rental applications" ON public.office_rentals;
DROP POLICY IF EXISTS "Admins can delete rental applications" ON public.office_rentals;

-- ========================================
-- office_spaces - remaining legacy policies
-- ========================================
DROP POLICY IF EXISTS "Admins can delete office spaces" ON public.office_spaces;
DROP POLICY IF EXISTS "Admins can insert office spaces" ON public.office_spaces;
DROP POLICY IF EXISTS "Admins can update office spaces" ON public.office_spaces;

-- ========================================
-- permission_audit_logs
-- ========================================
DROP POLICY IF EXISTS "Admins can view all permission audit logs" ON public.permission_audit_logs;
DROP POLICY IF EXISTS "Admins can create permission audit logs" ON public.permission_audit_logs;

-- ========================================
-- profiles - legacy update policy
-- ========================================
DROP POLICY IF EXISTS "Users can update own profile admins can update all" ON public.profiles;

-- Create proper policy for profile updates
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Platform admins can update any profile"
ON public.profiles FOR UPDATE TO authenticated
USING (public.is_platform_admin(auth.uid()))
WITH CHECK (public.is_platform_admin(auth.uid()));

-- ========================================
-- property_access_details - legacy policies
-- ========================================
DROP POLICY IF EXISTS "Property owners and admins can manage access details" ON public.property_access_details;
DROP POLICY IF EXISTS "Property owners and admins can view access details" ON public.property_access_details;

-- ========================================
-- property_checklist_item_completions - fix compound policies
-- ========================================
DROP POLICY IF EXISTS "Users can create checklist completions for their org" ON public.property_checklist_item_completions;
DROP POLICY IF EXISTS "Users can view checklist completions for their org" ON public.property_checklist_item_completions;
DROP POLICY IF EXISTS "Users can delete checklist completions for their org" ON public.property_checklist_item_completions;
DROP POLICY IF EXISTS "Users can update checklist completions for their org" ON public.property_checklist_item_completions;

-- Create proper org-scoped policies
CREATE POLICY "Org members can manage checklist completions"
ON public.property_checklist_item_completions FOR ALL TO authenticated
USING (
  public.is_platform_admin(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.property_checklist_runs pcr
    JOIN public.properties p ON p.id = pcr.property_id
    WHERE pcr.id = property_checklist_item_completions.run_id
    AND public.user_belongs_to_organization(auth.uid(), p.organization_id)
  )
)
WITH CHECK (
  public.is_platform_admin(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.property_checklist_runs pcr
    JOIN public.properties p ON p.id = pcr.property_id
    WHERE pcr.id = property_checklist_item_completions.run_id
    AND public.user_belongs_to_organization(auth.uid(), p.organization_id)
  )
);

-- ========================================
-- property_checklist_runs - fix compound policies
-- ========================================
DROP POLICY IF EXISTS "Users can update checklist runs for their org properties" ON public.property_checklist_runs;
DROP POLICY IF EXISTS "Users can view checklist runs for their org properties" ON public.property_checklist_runs;
DROP POLICY IF EXISTS "Users can create checklist runs for their org properties" ON public.property_checklist_runs;
DROP POLICY IF EXISTS "Users can delete checklist runs for their org properties" ON public.property_checklist_runs;

-- Create proper org-scoped policies
CREATE POLICY "Org members can manage checklist runs"
ON public.property_checklist_runs FOR ALL TO authenticated
USING (
  public.is_platform_admin(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = property_checklist_runs.property_id
    AND public.user_belongs_to_organization(auth.uid(), p.organization_id)
  )
)
WITH CHECK (
  public.is_platform_admin(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = property_checklist_runs.property_id
    AND public.user_belongs_to_organization(auth.uid(), p.organization_id)
  )
);

-- ========================================
-- reservations - fix compound policies
-- ========================================
DROP POLICY IF EXISTS "Users can update their own reservations or property owners can " ON public.reservations;
DROP POLICY IF EXISTS "Users can delete their own reservations or property owners can " ON public.reservations;

-- Create proper org-scoped policies for reservations
CREATE POLICY "Org members can update reservations"
ON public.reservations FOR UPDATE TO authenticated
USING (
  public.is_platform_admin(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = reservations.property_id
    AND public.user_belongs_to_organization(auth.uid(), p.organization_id)
  )
)
WITH CHECK (
  public.is_platform_admin(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = reservations.property_id
    AND public.user_belongs_to_organization(auth.uid(), p.organization_id)
  )
);

CREATE POLICY "Org admins can delete reservations"
ON public.reservations FOR DELETE TO authenticated
USING (
  public.is_platform_admin(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.properties p
    WHERE p.id = reservations.property_id
    AND public.user_is_org_admin(auth.uid(), p.organization_id)
  )
);

-- ========================================
-- testimonials - remaining legacy policies
-- ========================================
DROP POLICY IF EXISTS "Admins can manage testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admins can manage all testimonials" ON public.testimonials;

-- ========================================
-- tour_requests - remaining legacy policies
-- ========================================
DROP POLICY IF EXISTS "Users can view tour requests with their email" ON public.tour_requests;
DROP POLICY IF EXISTS "Admins can view all tour requests" ON public.tour_requests;

-- ========================================
-- user_invitations
-- ========================================
DROP POLICY IF EXISTS "Admins can manage all invitations" ON public.user_invitations;

-- ========================================
-- work_orders - remaining legacy compound policies
-- ========================================
DROP POLICY IF EXISTS "Property owners can view work orders for their properties" ON public.work_orders;
DROP POLICY IF EXISTS "Property owners can update their work orders" ON public.work_orders;