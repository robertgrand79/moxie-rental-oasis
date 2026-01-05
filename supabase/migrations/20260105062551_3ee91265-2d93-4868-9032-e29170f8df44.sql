-- =====================================================
-- UNIFIED TEMPLATE SYSTEM - SCHEMA UPDATES
-- =====================================================

-- 1. Add linking columns to organization_templates
-- Links visual templates to pricing tiers and source organizations
ALTER TABLE public.organization_templates 
ADD COLUMN IF NOT EXISTS pricing_tier_id uuid REFERENCES public.site_templates(id) ON DELETE SET NULL;

ALTER TABLE public.organization_templates 
ADD COLUMN IF NOT EXISTS source_organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL;

ALTER TABLE public.organization_templates 
ADD COLUMN IF NOT EXISTS include_demo_data boolean DEFAULT false;

ALTER TABLE public.organization_templates 
ADD COLUMN IF NOT EXISTS demo_data_config jsonb DEFAULT '{
  "copy_properties": true,
  "copy_reservations": false,
  "copy_blog_posts": true,
  "copy_pages": true,
  "copy_events": true,
  "copy_testimonials": true,
  "copy_points_of_interest": true,
  "copy_lifestyle_gallery": true,
  "copy_message_templates": true,
  "copy_checklist_templates": true
}'::jsonb;

-- 2. Add tracking column to organizations
-- Track which template was used to create this organization
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS created_from_template_id uuid REFERENCES public.organization_templates(id) ON DELETE SET NULL;

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_org_templates_pricing_tier ON public.organization_templates(pricing_tier_id);
CREATE INDEX IF NOT EXISTS idx_org_templates_source_org ON public.organization_templates(source_organization_id);
CREATE INDEX IF NOT EXISTS idx_organizations_template ON public.organizations(created_from_template_id);

-- 4. Add comments for documentation
COMMENT ON COLUMN public.organization_templates.pricing_tier_id IS 'Links to site_templates for pricing/subscription tier';
COMMENT ON COLUMN public.organization_templates.source_organization_id IS 'Source organization to copy settings and demo data from';
COMMENT ON COLUMN public.organization_templates.include_demo_data IS 'Whether to copy demo content when creating orgs from this template';
COMMENT ON COLUMN public.organization_templates.demo_data_config IS 'JSON config specifying which data types to copy';
COMMENT ON COLUMN public.organizations.created_from_template_id IS 'The visual template used to create this organization';

-- 5. Link existing templates to Moxie as source org (if exists)
UPDATE public.organization_templates ot
SET source_organization_id = (
  SELECT id FROM public.organizations 
  WHERE is_template = true AND is_active = true 
  LIMIT 1
)
WHERE ot.source_organization_id IS NULL;