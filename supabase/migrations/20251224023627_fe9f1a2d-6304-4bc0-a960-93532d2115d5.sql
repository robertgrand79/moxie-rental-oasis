-- Fix the security definer view issue by dropping it and using a function instead
DROP VIEW IF EXISTS public.organizations_safe;

-- Create a secure function instead of a view
CREATE OR REPLACE FUNCTION public.get_organizations_for_user()
RETURNS TABLE(
  id uuid,
  name text,
  slug text,
  logo_url text,
  website text,
  custom_domain text,
  is_active boolean,
  template_type text,
  is_template boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  has_stripe_configured boolean,
  has_seam_configured boolean,
  has_openphone_configured boolean,
  has_resend_configured boolean,
  has_pricelabs_configured boolean
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    o.id,
    o.name,
    o.slug,
    o.logo_url,
    o.website,
    o.custom_domain,
    o.is_active,
    o.template_type,
    o.is_template,
    o.created_at,
    o.updated_at,
    o.stripe_secret_key IS NOT NULL,
    o.seam_api_key IS NOT NULL,
    o.openphone_api_key IS NOT NULL,
    o.resend_api_key IS NOT NULL,
    o.pricelabs_api_key IS NOT NULL
  FROM public.organizations o
  WHERE public.user_belongs_to_organization(auth.uid(), o.id)
     OR public.is_platform_admin(auth.uid())
$$;