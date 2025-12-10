-- Drop and recreate get_organization_by_identifier with template_type
DROP FUNCTION IF EXISTS public.get_organization_by_identifier(text);

CREATE FUNCTION public.get_organization_by_identifier(_identifier text)
RETURNS TABLE(
  id uuid,
  name text,
  slug text,
  logo_url text,
  website text,
  custom_domain text,
  is_active boolean,
  template_type text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.name,
    o.slug,
    o.logo_url,
    o.website,
    o.custom_domain,
    o.is_active,
    o.template_type
  FROM public.organizations o
  WHERE (o.slug = _identifier OR o.custom_domain = _identifier)
    AND o.is_active = true
  LIMIT 1;
END;
$$;

-- Create function to get primary template organization for fallback
CREATE OR REPLACE FUNCTION public.get_primary_template_organization()
RETURNS TABLE(
  id uuid,
  name text,
  slug text,
  logo_url text,
  website text,
  custom_domain text,
  is_active boolean,
  template_type text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.name,
    o.slug,
    o.logo_url,
    o.website,
    o.custom_domain,
    o.is_active,
    o.template_type
  FROM public.organizations o
  WHERE o.is_template = true
    AND o.is_active = true
  ORDER BY o.created_at ASC
  LIMIT 1;
END;
$$;