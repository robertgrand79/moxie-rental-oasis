-- Clear "Mountain View Retreat" demo-template contact placeholders.
--
-- The demo template ships a fake phone number -- "(555) 123-CABIN",
-- which is not even a valid number (it contains letters) -- and a demo
-- email, hello@mountainviewcabin.com. create_organization_with_owner
-- copies the template source org's site_settings into every new org,
-- so any tenant cloned from that template inherits these placeholders.
--
-- The key consolidation (migration 20260519000000) then promotes the
-- legacy snake_case values into the canonical phone / contactEmail
-- keys whenever the canonical row is empty -- surfacing the fake
-- contact details on the tenant's live site (FAQ footer, contact page).
--
-- This migration runs after the consolidation (later timestamp), so the
-- values live under the canonical keys by the time it executes; the
-- legacy keys are listed too for robustness if any snake_case row
-- survives. Match is by exact value, so this is idempotent and only
-- ever touches the known demo strings.
--
-- An empty contact field is strictly better than a fake one: the FAQ
-- and contact UIs fall back to a generic "contact us" message. Real
-- values are entered by the tenant via Settings -> Contact.
--
-- This clears both the affected tenant (STACY+CO) and the template
-- source org itself, so orgs cloned from the template in the future
-- start with empty contact fields instead of inheriting the fakes.

UPDATE public.site_settings
SET value = '""'::jsonb,
    updated_at = now()
WHERE key IN ('phone', 'contactEmail', 'contactPhone', 'contact_phone', 'contact_email')
  AND value::text IN (
    '"(555) 123-CABIN"',
    '"hello@mountainviewcabin.com"'
  );
