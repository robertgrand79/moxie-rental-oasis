-- Phase 3: Replace generic is_admin() with organization-scoped checks

-- 1. newsletter_subscribers - replace is_admin with org-scoped
DROP POLICY IF EXISTS "Admins can manage subscribers" ON newsletter_subscribers;
CREATE POLICY "Org admins can manage subscribers" ON newsletter_subscribers
  FOR ALL USING (
    public.user_is_org_admin(auth.uid(), organization_id)
    OR public.is_platform_admin(auth.uid())
  );

-- 2. contractors - replace is_admin with org-scoped
DROP POLICY IF EXISTS "Admins can manage contractors" ON contractors;
DROP POLICY IF EXISTS "Admin users can manage contractors" ON contractors;
CREATE POLICY "Org admins can manage contractors" ON contractors
  FOR ALL USING (
    public.user_is_org_admin(auth.uid(), organization_id)
    OR public.is_platform_admin(auth.uid())
  );

-- 3. guests - replace is_admin with org-scoped
DROP POLICY IF EXISTS "Admins can manage guests" ON guests;
DROP POLICY IF EXISTS "Admin users can manage guests" ON guests;
CREATE POLICY "Org admins can manage guests" ON guests
  FOR ALL USING (
    public.user_is_org_admin(auth.uid(), organization_id)
    OR public.is_platform_admin(auth.uid())
  );

-- 4. reservations - fix public insert and admin policies
DROP POLICY IF EXISTS "Admins can manage reservations" ON reservations;
DROP POLICY IF EXISTS "Admin users can manage reservations" ON reservations;
CREATE POLICY "Org admins can manage reservations" ON reservations
  FOR ALL USING (
    public.user_is_org_admin(auth.uid(), organization_id)
    OR public.is_platform_admin(auth.uid())
  );

-- Fix reservations public insert - require valid property
DROP POLICY IF EXISTS "Public can create reservations" ON reservations;
DROP POLICY IF EXISTS "Anyone can create reservations" ON reservations;
CREATE POLICY "Public can create reservations for valid properties" ON reservations
  FOR INSERT WITH CHECK (
    property_id IS NOT NULL 
    AND EXISTS (SELECT 1 FROM properties p WHERE p.id = property_id)
  );

-- 5. property_reservations - replace is_admin with org-scoped
DROP POLICY IF EXISTS "Admins can manage property reservations" ON property_reservations;
DROP POLICY IF EXISTS "Admin users can manage property reservations" ON property_reservations;
CREATE POLICY "Org admins can manage property reservations" ON property_reservations
  FOR ALL USING (
    public.user_is_org_admin(auth.uid(), organization_id)
    OR public.is_platform_admin(auth.uid())
  );

-- 6. user_invitations - replace is_admin with org-scoped
DROP POLICY IF EXISTS "Admins can manage invitations" ON user_invitations;
DROP POLICY IF EXISTS "Admin users can manage invitations" ON user_invitations;
CREATE POLICY "Org admins can manage invitations" ON user_invitations
  FOR ALL USING (
    public.user_is_org_admin(auth.uid(), organization_id)
    OR public.is_platform_admin(auth.uid())
  );

-- 7. projects - fix public read to org-scoped
DROP POLICY IF EXISTS "Anyone can view projects" ON projects;
DROP POLICY IF EXISTS "Public can view projects" ON projects;
CREATE POLICY "Org members can view projects" ON projects
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
    OR public.is_platform_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Admins can manage projects" ON projects;
CREATE POLICY "Org admins can manage projects" ON projects
  FOR ALL USING (
    public.user_is_org_admin(auth.uid(), organization_id)
    OR public.is_platform_admin(auth.uid())
  );

-- 8. orders - replace is_admin with org-scoped
DROP POLICY IF EXISTS "Admins can manage orders" ON orders;
DROP POLICY IF EXISTS "Admin users can manage orders" ON orders;
CREATE POLICY "Org admins can manage orders" ON orders
  FOR ALL USING (
    public.user_is_org_admin(auth.uid(), organization_id)
    OR public.is_platform_admin(auth.uid())
  );

-- 9. subscribers - replace is_admin with org-scoped
DROP POLICY IF EXISTS "Admins can manage subscribers" ON subscribers;
DROP POLICY IF EXISTS "Admin users can manage subscribers" ON subscribers;
CREATE POLICY "Org admins can manage subscribers" ON subscribers
  FOR ALL USING (
    public.user_is_org_admin(auth.uid(), organization_id)
    OR public.is_platform_admin(auth.uid())
  );

-- 10. social_links - replace is_admin with org-scoped
DROP POLICY IF EXISTS "Admins can manage social links" ON social_links;
DROP POLICY IF EXISTS "Admin users can manage social links" ON social_links;
CREATE POLICY "Org admins can manage social links" ON social_links
  FOR ALL USING (
    public.user_is_org_admin(auth.uid(), organization_id)
    OR public.is_platform_admin(auth.uid())
  );

-- 11. content_approval_items - replace is_admin with org-scoped
DROP POLICY IF EXISTS "Admins can manage content approval" ON content_approval_items;
DROP POLICY IF EXISTS "Admin users can manage content approval" ON content_approval_items;
CREATE POLICY "Org admins can manage content approval" ON content_approval_items
  FOR ALL USING (
    public.user_is_org_admin(auth.uid(), organization_id)
    OR public.is_platform_admin(auth.uid())
  );

-- 12. tour_requests - add org_id and basic RLS (no property_id exists)
ALTER TABLE tour_requests ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id);
CREATE INDEX IF NOT EXISTS idx_tour_requests_org ON tour_requests(organization_id);

ALTER TABLE tour_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage tour requests" ON tour_requests;
DROP POLICY IF EXISTS "Admin users can manage tour requests" ON tour_requests;

CREATE POLICY "Org admins can manage tour requests" ON tour_requests
  FOR ALL USING (
    public.user_is_org_admin(auth.uid(), organization_id)
    OR public.is_platform_admin(auth.uid())
  );

CREATE POLICY "Org members can view tour requests" ON tour_requests
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
    OR public.is_platform_admin(auth.uid())
  );

DROP POLICY IF EXISTS "Anyone can create tour requests" ON tour_requests;
DROP POLICY IF EXISTS "Public can create tour requests" ON tour_requests;
CREATE POLICY "Public can submit tour requests" ON tour_requests
  FOR INSERT WITH CHECK (true);