-- Enforce tenant ownership on every property.
--
-- A property with a NULL organization_id is invisible on every tenant site
-- (the public listing filters by organization_id) and editable only by
-- platform admins. All existing rows already have an organization_id, and
-- every insert path (admin forms, onboarding, org-clone) sets it.

ALTER TABLE public.properties ALTER COLUMN organization_id SET NOT NULL;
