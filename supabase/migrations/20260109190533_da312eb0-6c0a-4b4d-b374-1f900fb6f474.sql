-- Set preview_url for organization_templates so Live Demo buttons work on signup page
UPDATE organization_templates
SET preview_url = 'https://staymoxie-template-single.staymoxie.com'
WHERE source_organization_id = 'b0000000-0000-0000-0000-000000000001';

UPDATE organization_templates
SET preview_url = 'https://staymoxie-template-multi.staymoxie.com'
WHERE source_organization_id = 'c0000000-0000-0000-0000-000000000001';