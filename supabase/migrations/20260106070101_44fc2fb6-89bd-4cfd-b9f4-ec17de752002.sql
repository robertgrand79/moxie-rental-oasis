-- Create the new StayMoxie Multi Template organization
INSERT INTO public.organizations (
  id,
  name,
  slug,
  is_template,
  is_template_source,
  template_type,
  template_category,
  is_active,
  subscription_status,
  subscription_tier
) VALUES (
  'c0000000-0000-0000-0000-000000000001',
  'StayMoxie Multi Template',
  'staymoxie-template-multi',
  true,
  true,
  'multi_property',
  'multi',
  true,
  'active',
  'professional'
);

-- Update Moxie Vacation Rentals to no longer be a template source
UPDATE public.organizations 
SET is_template_source = false, is_template = false
WHERE slug = 'moxie';

-- Update organization_templates to point to the new source org for multi templates
UPDATE public.organization_templates 
SET source_organization_id = 'c0000000-0000-0000-0000-000000000001'
WHERE template_type = 'multi_property';