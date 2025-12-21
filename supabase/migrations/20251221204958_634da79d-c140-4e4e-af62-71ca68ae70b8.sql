-- Create a secure table for organization secrets that only edge functions can access
CREATE TABLE IF NOT EXISTS public.organization_secrets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  secret_name TEXT NOT NULL,
  encrypted_value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, secret_name)
);

-- Enable RLS
ALTER TABLE public.organization_secrets ENABLE ROW LEVEL SECURITY;

-- Only service role (edge functions) can access secrets - NO client access
CREATE POLICY "Service role only"
ON public.organization_secrets
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Platform admins can view (but should use edge functions for actual values)
CREATE POLICY "Platform admins can view secrets metadata"
ON public.organization_secrets
FOR SELECT
TO authenticated
USING (is_platform_admin(auth.uid()));

-- Create a security definer function to get secrets (for edge functions)
CREATE OR REPLACE FUNCTION public.get_organization_secret(_org_id UUID, _secret_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  _encrypted_value TEXT;
BEGIN
  SELECT encrypted_value INTO _encrypted_value
  FROM public.organization_secrets
  WHERE organization_id = _org_id
    AND secret_name = _secret_name;
  
  RETURN _encrypted_value;
END;
$$;

-- Revoke execute from public, only allow service_role
REVOKE EXECUTE ON FUNCTION public.get_organization_secret(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_organization_secret(UUID, TEXT) TO service_role;

-- Update trigger for updated_at
CREATE TRIGGER update_organization_secrets_updated_at
  BEFORE UPDATE ON public.organization_secrets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Now fix the organizations table policies to use authenticated role
DROP POLICY IF EXISTS "Platform admins can manage all organizations" ON public.organizations;
DROP POLICY IF EXISTS "Platform admins can view all organizations" ON public.organizations;
DROP POLICY IF EXISTS "Public can view limited org info via function" ON public.organizations;
DROP POLICY IF EXISTS "Users can view their own organization" ON public.organizations;
DROP POLICY IF EXISTS "Org admins can update their organization" ON public.organizations;

-- Recreate with authenticated role and stricter access
CREATE POLICY "Platform admins can manage all organizations"
ON public.organizations
FOR ALL
TO authenticated
USING (is_platform_admin(auth.uid()))
WITH CHECK (is_platform_admin(auth.uid()));

CREATE POLICY "Users can view their own organization"
ON public.organizations
FOR SELECT
TO authenticated
USING (user_belongs_to_organization(auth.uid(), id));

CREATE POLICY "Org admins can update non-secret fields"
ON public.organizations
FOR UPDATE
TO authenticated
USING (user_is_org_admin(auth.uid(), id))
WITH CHECK (user_is_org_admin(auth.uid(), id));