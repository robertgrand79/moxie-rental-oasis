-- Phase 5: Tenant Onboarding & Duplication

-- Add template flag to organizations for duplication source
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS is_template boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_step integer DEFAULT 0;

-- Create onboarding progress tracking table
CREATE TABLE IF NOT EXISTS public.organization_onboarding (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  step_name text NOT NULL,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, step_name)
);

-- Enable RLS
ALTER TABLE public.organization_onboarding ENABLE ROW LEVEL SECURITY;

-- RLS policies for onboarding
CREATE POLICY "Organization members can view their onboarding progress"
ON public.organization_onboarding
FOR SELECT
USING (
  public.can_access_organization(auth.uid(), organization_id)
);

CREATE POLICY "Organization admins can manage onboarding"
ON public.organization_onboarding
FOR ALL
USING (
  public.can_manage_organization(auth.uid(), organization_id)
);

-- Function to create a new organization with owner
CREATE OR REPLACE FUNCTION public.create_organization_with_owner(
  _name text,
  _slug text,
  _user_id uuid,
  _template_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _org_id uuid;
BEGIN
  -- Create the organization
  INSERT INTO public.organizations (name, slug, is_active, onboarding_completed, onboarding_step)
  VALUES (_name, _slug, true, false, 0)
  RETURNING id INTO _org_id;
  
  -- Add the user as owner
  INSERT INTO public.organization_members (organization_id, user_id, role)
  VALUES (_org_id, _user_id, 'owner');
  
  -- Update user profile with organization_id
  UPDATE public.profiles 
  SET organization_id = _org_id 
  WHERE id = _user_id;
  
  -- If template provided, duplicate settings
  IF _template_id IS NOT NULL THEN
    -- Copy site_settings
    INSERT INTO public.site_settings (organization_id, key, value, created_by)
    SELECT _org_id, key, value, _user_id
    FROM public.site_settings
    WHERE organization_id = _template_id;
    
    -- Copy message_templates (global ones)
    INSERT INTO public.message_templates (
      name, subject, content, category, is_active, is_default, created_by
    )
    SELECT 
      name, subject, content, category, is_active, is_default, _user_id
    FROM public.message_templates
    WHERE property_id IS NULL 
    AND created_by IN (
      SELECT user_id FROM public.organization_members WHERE organization_id = _template_id
    );
  END IF;
  
  -- Create initial onboarding steps
  INSERT INTO public.organization_onboarding (organization_id, step_name)
  VALUES 
    (_org_id, 'branding'),
    (_org_id, 'contact'),
    (_org_id, 'property'),
    (_org_id, 'payments');
  
  RETURN _org_id;
END;
$$;

-- Function to check if slug is available
CREATE OR REPLACE FUNCTION public.is_slug_available(_slug text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM public.organizations WHERE slug = _slug
  )
$$;

-- Index for faster slug lookups
CREATE INDEX IF NOT EXISTS idx_organizations_is_template ON public.organizations(is_template) WHERE is_template = true;