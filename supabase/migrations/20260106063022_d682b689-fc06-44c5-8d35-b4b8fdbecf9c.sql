-- Rename "Mountain Retreat" to "Starter"
UPDATE public.organization_templates
SET name = 'Starter'
WHERE id = '321366ef-63d2-4d22-b66c-da009effe1a6';

-- Rename "Portfolio Pro" to "Professional"
UPDATE public.organization_templates
SET name = 'Professional'
WHERE id = '89d86272-e21a-47c8-8f7b-9aeae7af5ddd';