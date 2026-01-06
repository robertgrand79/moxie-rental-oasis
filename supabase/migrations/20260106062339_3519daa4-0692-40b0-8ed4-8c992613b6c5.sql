-- Update "Mountain Retreat" organization_template to link to Starter tier and staymoxie-template-single
UPDATE public.organization_templates
SET 
  pricing_tier_id = '5f8d4e82-8035-4e6e-ae72-aba2edd9d708', -- Starter tier ($79/month)
  source_organization_id = 'b0000000-0000-0000-0000-000000000001', -- staymoxie-template-single
  include_demo_data = true,
  demo_data_config = '{
    "properties": true,
    "blog_posts": true,
    "testimonials": true,
    "points_of_interest": true,
    "message_templates": true,
    "lifestyle_gallery": true,
    "checklist_templates": true
  }'::jsonb,
  template_type = 'single_property',
  feature_highlights = '["AI Chat Assistant", "Direct Booking", "Automated Messages", "Guest Portal"]'::jsonb,
  recommended_for = ARRAY['cabin_rental', 'vacation_home', 'single_property_owner']
WHERE id = '321366ef-63d2-4d22-b66c-da009effe1a6';

-- Update "Portfolio Pro" organization_template to link to Professional tier and Moxie org
UPDATE public.organization_templates
SET 
  pricing_tier_id = '5e3d47a0-e60e-400b-8e33-c80fd721faff', -- Professional tier ($179/month)
  source_organization_id = 'a0000000-0000-0000-0000-000000000001', -- Moxie org
  include_demo_data = true,
  demo_data_config = '{
    "properties": true,
    "blog_posts": true,
    "testimonials": true,
    "points_of_interest": true,
    "message_templates": true,
    "lifestyle_gallery": true,
    "checklist_templates": true
  }'::jsonb,
  template_type = 'multi_property',
  feature_highlights = '["Multi-Property Support", "AI Chat Assistant", "Direct Booking", "Portfolio Display", "Automated Messages"]'::jsonb,
  recommended_for = ARRAY['property_manager', 'multi_property_owner', 'vacation_rental_business']
WHERE id = '89d86272-e21a-47c8-8f7b-9aeae7af5ddd';

-- Mark staymoxie-template-single as a template source
UPDATE public.organizations
SET is_template_source = true
WHERE id = 'b0000000-0000-0000-0000-000000000001';

-- Keep Moxie org as template source (it's the multi-property demo)
UPDATE public.organizations
SET is_template_source = true
WHERE id = 'a0000000-0000-0000-0000-000000000001';