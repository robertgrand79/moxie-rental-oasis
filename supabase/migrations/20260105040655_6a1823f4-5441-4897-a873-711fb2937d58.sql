-- Phase 5: Final Organization Isolation
-- Add organization_id to remaining 7 tenant tables

-- ============================================
-- TRIGGER FUNCTIONS
-- ============================================

-- Function to derive org_id from profile (for created_by/user_id columns)
CREATE OR REPLACE FUNCTION public.set_organization_id_from_profile()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.organization_id IS NULL THEN
    SELECT om.organization_id INTO NEW.organization_id
    FROM organization_members om
    WHERE om.user_id = COALESCE(NEW.created_by, NEW.user_id)
    LIMIT 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to derive org_id from contractor
CREATE OR REPLACE FUNCTION public.set_organization_id_from_contractor()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.organization_id IS NULL AND NEW.contractor_id IS NOT NULL THEN
    SELECT organization_id INTO NEW.organization_id
    FROM contractors WHERE id = NEW.contractor_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================
-- TABLE 1: contractor_access_tokens
-- ============================================
ALTER TABLE public.contractor_access_tokens 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);

CREATE INDEX IF NOT EXISTS idx_contractor_access_tokens_org 
ON public.contractor_access_tokens(organization_id);

-- Backfill from contractors table
UPDATE public.contractor_access_tokens cat
SET organization_id = c.organization_id
FROM public.contractors c
WHERE cat.contractor_id = c.id
AND cat.organization_id IS NULL;

-- Attach trigger
DROP TRIGGER IF EXISTS set_contractor_access_tokens_org_id ON public.contractor_access_tokens;
CREATE TRIGGER set_contractor_access_tokens_org_id
  BEFORE INSERT ON public.contractor_access_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.set_organization_id_from_contractor();

-- RLS
ALTER TABLE public.contractor_access_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contractor_access_tokens_org_isolation" ON public.contractor_access_tokens;
CREATE POLICY "contractor_access_tokens_org_isolation" ON public.contractor_access_tokens
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE user_id = auth.uid()
    )
    OR public.is_platform_admin(auth.uid())
  );

-- ============================================
-- TABLE 2: content_approval_items
-- ============================================
ALTER TABLE public.content_approval_items 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);

CREATE INDEX IF NOT EXISTS idx_content_approval_items_org 
ON public.content_approval_items(organization_id);

-- Backfill from organization_members
UPDATE public.content_approval_items cai
SET organization_id = om.organization_id
FROM public.organization_members om
WHERE cai.created_by::uuid = om.user_id
AND cai.organization_id IS NULL;

-- Attach trigger
DROP TRIGGER IF EXISTS set_content_approval_items_org_id ON public.content_approval_items;
CREATE TRIGGER set_content_approval_items_org_id
  BEFORE INSERT ON public.content_approval_items
  FOR EACH ROW
  EXECUTE FUNCTION public.set_organization_id_from_profile();

-- RLS
ALTER TABLE public.content_approval_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "content_approval_items_org_isolation" ON public.content_approval_items;
CREATE POLICY "content_approval_items_org_isolation" ON public.content_approval_items
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE user_id = auth.uid()
    )
    OR public.is_platform_admin(auth.uid())
  );

-- ============================================
-- TABLE 3: social_links
-- ============================================
ALTER TABLE public.social_links 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);

CREATE INDEX IF NOT EXISTS idx_social_links_org 
ON public.social_links(organization_id);

-- Backfill from organization_members
UPDATE public.social_links sl
SET organization_id = om.organization_id
FROM public.organization_members om
WHERE sl.created_by = om.user_id
AND sl.organization_id IS NULL;

-- Attach trigger
DROP TRIGGER IF EXISTS set_social_links_org_id ON public.social_links;
CREATE TRIGGER set_social_links_org_id
  BEFORE INSERT ON public.social_links
  FOR EACH ROW
  EXECUTE FUNCTION public.set_organization_id_from_profile();

-- RLS
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "social_links_org_isolation" ON public.social_links;
CREATE POLICY "social_links_org_isolation" ON public.social_links
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE user_id = auth.uid()
    )
    OR public.is_platform_admin(auth.uid())
  );

-- ============================================
-- TABLE 4: subscribers
-- ============================================
ALTER TABLE public.subscribers 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);

CREATE INDEX IF NOT EXISTS idx_subscribers_org 
ON public.subscribers(organization_id);

-- Backfill from organization_members
UPDATE public.subscribers s
SET organization_id = om.organization_id
FROM public.organization_members om
WHERE s.user_id = om.user_id
AND s.organization_id IS NULL;

-- Attach trigger
DROP TRIGGER IF EXISTS set_subscribers_org_id ON public.subscribers;
CREATE TRIGGER set_subscribers_org_id
  BEFORE INSERT ON public.subscribers
  FOR EACH ROW
  EXECUTE FUNCTION public.set_organization_id_from_profile();

-- RLS
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "subscribers_org_isolation" ON public.subscribers;
CREATE POLICY "subscribers_org_isolation" ON public.subscribers
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE user_id = auth.uid()
    )
    OR public.is_platform_admin(auth.uid())
  );

-- ============================================
-- TABLE 5: guests
-- ============================================
ALTER TABLE public.guests 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);

CREATE INDEX IF NOT EXISTS idx_guests_org 
ON public.guests(organization_id);

-- Backfill from reservations
UPDATE public.guests g
SET organization_id = r.organization_id
FROM public.reservations r
WHERE g.reservation_id = r.id
AND g.organization_id IS NULL;

-- Create trigger function for guests
CREATE OR REPLACE FUNCTION public.set_organization_id_from_guest_reservation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.organization_id IS NULL AND NEW.reservation_id IS NOT NULL THEN
    SELECT organization_id INTO NEW.organization_id
    FROM reservations WHERE id = NEW.reservation_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Attach trigger
DROP TRIGGER IF EXISTS set_guests_org_id ON public.guests;
CREATE TRIGGER set_guests_org_id
  BEFORE INSERT ON public.guests
  FOR EACH ROW
  EXECUTE FUNCTION public.set_organization_id_from_guest_reservation();

-- RLS
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "guests_org_isolation" ON public.guests;
CREATE POLICY "guests_org_isolation" ON public.guests
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE user_id = auth.uid()
    )
    OR public.is_platform_admin(auth.uid())
  );

-- ============================================
-- TABLE 6: orders
-- ============================================
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);

CREATE INDEX IF NOT EXISTS idx_orders_org 
ON public.orders(organization_id);

-- Backfill from organization_members
UPDATE public.orders o
SET organization_id = om.organization_id
FROM public.organization_members om
WHERE o.user_id = om.user_id
AND o.organization_id IS NULL;

-- Attach trigger
DROP TRIGGER IF EXISTS set_orders_org_id ON public.orders;
CREATE TRIGGER set_orders_org_id
  BEFORE INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_organization_id_from_profile();

-- RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orders_org_isolation" ON public.orders;
CREATE POLICY "orders_org_isolation" ON public.orders
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE user_id = auth.uid()
    )
    OR public.is_platform_admin(auth.uid())
  );

-- ============================================
-- TABLE 7: projects
-- ============================================
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);

CREATE INDEX IF NOT EXISTS idx_projects_org 
ON public.projects(organization_id);

-- Backfill from organization_members
UPDATE public.projects p
SET organization_id = om.organization_id
FROM public.organization_members om
WHERE p.created_by = om.user_id
AND p.organization_id IS NULL;

-- Attach trigger
DROP TRIGGER IF EXISTS set_projects_org_id ON public.projects;
CREATE TRIGGER set_projects_org_id
  BEFORE INSERT ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.set_organization_id_from_profile();

-- RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "projects_org_isolation" ON public.projects;
CREATE POLICY "projects_org_isolation" ON public.projects
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM public.organization_members 
      WHERE user_id = auth.uid()
    )
    OR public.is_platform_admin(auth.uid())
  );