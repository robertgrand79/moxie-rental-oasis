-- =============================================
-- PHASE 1: Multi-Tenant SaaS Foundation
-- =============================================

-- 1. Create the main organization (Moxie Vacation Rentals)
INSERT INTO public.organizations (
  id,
  name,
  slug,
  website,
  is_active,
  subscription_status,
  subscription_tier
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Moxie Vacation Rentals',
  'moxie',
  'https://moxievacationrentals.com',
  true,
  'active',
  'pro'
);

-- 2. Link all existing properties to this organization
UPDATE public.properties 
SET organization_id = 'a0000000-0000-0000-0000-000000000001'
WHERE organization_id IS NULL;

-- 3. Link all existing users as organization members
-- robert@moxievacationrentals.com as owner
INSERT INTO public.organization_members (organization_id, user_id, role)
VALUES ('a0000000-0000-0000-0000-000000000001', '5e338471-fb23-4b34-9f98-b994ccae47f7', 'owner')
ON CONFLICT (organization_id, user_id) DO NOTHING;

-- robert@grandrei.com as admin
INSERT INTO public.organization_members (organization_id, user_id, role)
VALUES ('a0000000-0000-0000-0000-000000000001', '758f2c1d-d7c5-42eb-97d7-45fc95d3a2ab', 'admin')
ON CONFLICT (organization_id, user_id) DO NOTHING;

-- jacie@grandrei.com as admin
INSERT INTO public.organization_members (organization_id, user_id, role)
VALUES ('a0000000-0000-0000-0000-000000000001', '386af061-69e7-4ae0-9521-e6fe67ce5cf6', 'admin')
ON CONFLICT (organization_id, user_id) DO NOTHING;

-- 4. Update profiles with organization_id
UPDATE public.profiles 
SET organization_id = 'a0000000-0000-0000-0000-000000000001'
WHERE organization_id IS NULL;

-- 5. Update site_settings with organization_id
UPDATE public.site_settings 
SET organization_id = 'a0000000-0000-0000-0000-000000000001'
WHERE organization_id IS NULL;

-- 6. Create super_admin role type for platform-level access (separate from org roles)
DO $$ BEGIN
  CREATE TYPE public.platform_role AS ENUM ('super_admin', 'support', 'billing');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 7. Create platform_admins table for super admin access (platform-level, not org-level)
CREATE TABLE IF NOT EXISTS public.platform_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  role public.platform_role NOT NULL DEFAULT 'super_admin',
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES auth.users(id),
  is_active boolean NOT NULL DEFAULT true
);

-- 8. Enable RLS on platform_admins
ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;

-- 9. Create security definer function to check platform admin status
CREATE OR REPLACE FUNCTION public.is_platform_admin(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.platform_admins
    WHERE user_id = _user_id
      AND is_active = true
  )
$$;

-- 10. Create function to check specific platform role
CREATE OR REPLACE FUNCTION public.has_platform_role(_user_id uuid, _role public.platform_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.platform_admins
    WHERE user_id = _user_id
      AND role = _role
      AND is_active = true
  )
$$;

-- 11. RLS policies for platform_admins table
CREATE POLICY "Only platform admins can view platform admins"
ON public.platform_admins FOR SELECT
USING (public.is_platform_admin(auth.uid()));

CREATE POLICY "Only super admins can manage platform admins"
ON public.platform_admins FOR ALL
USING (public.has_platform_role(auth.uid(), 'super_admin'));

-- 12. Make robert@moxievacationrentals.com a super admin (platform owner)
INSERT INTO public.platform_admins (user_id, role, is_active)
VALUES ('5e338471-fb23-4b34-9f98-b994ccae47f7', 'super_admin', true)
ON CONFLICT (user_id) DO NOTHING;

-- 13. Add organization_id to tables that need it but don't have it
-- Check and add to work_orders if missing
DO $$ BEGIN
  ALTER TABLE public.work_orders ADD COLUMN organization_id uuid REFERENCES public.organizations(id);
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

-- Update work_orders with organization from their property
UPDATE public.work_orders wo
SET organization_id = p.organization_id
FROM public.properties p
WHERE wo.property_id = p.id
  AND wo.organization_id IS NULL;

-- 14. Add organization_id to reservations if missing
DO $$ BEGIN
  ALTER TABLE public.reservations ADD COLUMN organization_id uuid REFERENCES public.organizations(id);
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

UPDATE public.reservations r
SET organization_id = p.organization_id
FROM public.properties p
WHERE r.property_id = p.id
  AND r.organization_id IS NULL;

-- 15. Add organization_id to property_reservations if missing
DO $$ BEGIN
  ALTER TABLE public.property_reservations ADD COLUMN organization_id uuid REFERENCES public.organizations(id);
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

UPDATE public.property_reservations pr
SET organization_id = p.organization_id
FROM public.properties p
WHERE pr.property_id = p.id
  AND pr.organization_id IS NULL;

-- 16. Create index for organization lookups
CREATE INDEX IF NOT EXISTS idx_properties_organization_id ON public.properties(organization_id);
CREATE INDEX IF NOT EXISTS idx_profiles_organization_id ON public.profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_site_settings_organization_id ON public.site_settings(organization_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_organization_id ON public.work_orders(organization_id);

-- 17. Update properties RLS to use organization context
DROP POLICY IF EXISTS "Users can view properties in their organization" ON public.properties;
CREATE POLICY "Users can view properties in their organization"
ON public.properties FOR SELECT
USING (
  public.user_belongs_to_organization(auth.uid(), organization_id)
  OR public.is_platform_admin(auth.uid())
  OR true  -- Public can view all properties for booking
);

DROP POLICY IF EXISTS "Org admins can manage properties" ON public.properties;
CREATE POLICY "Org admins can manage properties"
ON public.properties FOR ALL
USING (
  public.user_is_org_admin(auth.uid(), organization_id)
  OR public.is_platform_admin(auth.uid())
);

-- 18. Update site_settings RLS for organization scoping
DROP POLICY IF EXISTS "Users can view site settings in their organization" ON public.site_settings;
CREATE POLICY "Users can view site settings in their organization"
ON public.site_settings FOR SELECT
USING (
  public.user_belongs_to_organization(auth.uid(), organization_id)
  OR public.is_platform_admin(auth.uid())
  OR organization_id IS NOT NULL  -- Allow reading for public site rendering
);

DROP POLICY IF EXISTS "Org admins can manage site settings" ON public.site_settings;
CREATE POLICY "Org admins can manage site settings"
ON public.site_settings FOR ALL
USING (
  public.user_is_org_admin(auth.uid(), organization_id)
  OR public.is_platform_admin(auth.uid())
);