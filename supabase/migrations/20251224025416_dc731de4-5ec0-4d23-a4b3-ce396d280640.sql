-- Add domain verification tracking to organizations
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS domain_verification_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS domain_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS domain_last_checked_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS domain_dns_records JSONB;

-- Add check constraint for valid status values
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'organizations_domain_verification_status_check'
  ) THEN
    ALTER TABLE public.organizations 
    ADD CONSTRAINT organizations_domain_verification_status_check 
    CHECK (domain_verification_status IN ('pending', 'verified', 'failed', 'offline', NULL));
  END IF;
END $$;

-- Drop existing function to allow return type change
DROP FUNCTION IF EXISTS public.get_organizations_for_user();

-- Recreate function with new fields
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
  has_pricelabs_configured boolean,
  domain_verification_status text,
  domain_verified_at timestamp with time zone
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
    o.pricelabs_api_key IS NOT NULL,
    o.domain_verification_status,
    o.domain_verified_at
  FROM public.organizations o
  WHERE public.user_belongs_to_organization(auth.uid(), o.id)
     OR public.is_platform_admin(auth.uid())
$$;

-- Create function to update domain verification status
CREATE OR REPLACE FUNCTION public.update_domain_verification_status(
  _org_id UUID,
  _status TEXT,
  _dns_records JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.organizations
  SET 
    domain_verification_status = _status,
    domain_verified_at = CASE WHEN _status = 'verified' THEN NOW() ELSE domain_verified_at END,
    domain_last_checked_at = NOW(),
    domain_dns_records = COALESCE(_dns_records, domain_dns_records)
  WHERE id = _org_id
    AND (
      public.user_belongs_to_organization(auth.uid(), _org_id)
      OR public.is_platform_admin(auth.uid())
    );
END;
$$;