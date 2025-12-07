-- Phase 4: Multi-Tenant Routing
-- Add custom domain support to organizations

ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS custom_domain text UNIQUE;

-- Add index for fast domain lookups
CREATE INDEX IF NOT EXISTS idx_organizations_custom_domain ON public.organizations(custom_domain) WHERE custom_domain IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(slug);

-- Function to get organization by domain or slug
CREATE OR REPLACE FUNCTION public.get_organization_by_identifier(_identifier text)
RETURNS TABLE (
  id uuid,
  name text,
  slug text,
  logo_url text,
  website text,
  custom_domain text,
  is_active boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    o.id,
    o.name,
    o.slug,
    o.logo_url,
    o.website,
    o.custom_domain,
    o.is_active
  FROM public.organizations o
  WHERE (o.slug = _identifier OR o.custom_domain = _identifier)
    AND o.is_active = true
  LIMIT 1
$$;

-- RLS policy for public to read organizations by slug/domain
DROP POLICY IF EXISTS "Public can view active organizations" ON public.organizations;
CREATE POLICY "Public can view active organizations"
ON public.organizations
FOR SELECT
USING (is_active = true);