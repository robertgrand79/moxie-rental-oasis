-- Fix SECURITY DEFINER view warning by using SECURITY INVOKER (the default)
-- The view should respect the RLS policies of the querying user, not bypass them

DROP VIEW IF EXISTS public.organizations_public;

-- Recreate the view with explicit SECURITY INVOKER
CREATE VIEW public.organizations_public 
WITH (security_invoker = true)
AS
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

-- Grant access to the view
GRANT SELECT ON public.organizations_public TO anon, authenticated;

-- However, since the underlying table now requires authentication,
-- we need to ensure public tenant detection still works.
-- The get_organization_by_identifier function already handles this safely.

-- Let's also add a policy that allows public to read ONLY specific non-sensitive columns
-- by creating a more granular approach using the existing SECURITY DEFINER function

-- Actually, the cleanest approach: keep the existing get_organization_by_identifier 
-- function for public lookups (it's SECURITY DEFINER with limited columns)
-- and remove the view entirely since it won't work for anon users anyway

DROP VIEW IF EXISTS public.organizations_public;