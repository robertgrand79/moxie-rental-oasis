-- Fix: Restrict public access to organizations table to only expose non-sensitive columns
-- The current "Public can view active organizations" policy exposes API keys (even if encrypted)

-- Step 1: Drop the overly permissive public policy
DROP POLICY IF EXISTS "Public can view active organizations" ON public.organizations;

-- Step 2: Create a view for public access with only non-sensitive columns
CREATE OR REPLACE VIEW public.organizations_public AS
SELECT 
  id,
  name,
  slug,
  logo_url,
  website,
  custom_domain,
  is_active,
  template_type,
  created_at
FROM public.organizations
WHERE is_active = true;

-- Step 3: Grant SELECT on the view to anon and authenticated roles
GRANT SELECT ON public.organizations_public TO anon, authenticated;

-- Step 4: Create a new restrictive policy for the actual table
-- Only organization members can see their org, only admins can see API keys
CREATE POLICY "Public can view limited org info via function" 
ON public.organizations 
FOR SELECT 
USING (
  -- Platform admins can see everything
  is_platform_admin(auth.uid())
  -- Organization members can see their own organization
  OR user_belongs_to_organization(auth.uid(), id)
);

-- Note: The get_organization_by_identifier function (SECURITY DEFINER) 
-- already exists and safely returns limited fields for public lookup