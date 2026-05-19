-- Consolidate legacy site_settings keys to their canonical camelCase counterparts.
--
-- Background: create_organization_with_owner seeds site_settings with camelCase
-- keys (siteName, siteLogo, contactEmail, phone). The Settings page reads/writes
-- the same camelCase keys. An older version of the onboarding wizard wrote
-- snake_case keys (site_name, logo_url, contact_email, contact_phone), producing
-- two parallel rows per concept and leaving the public renderer to pick a value
-- via fallback chains.
--
-- For each (legacy_key, canonical_key) pair below:
--   1. If the canonical row is missing or empty, promote the legacy value into it.
--   2. Delete the legacy row unconditionally.
--
-- A non-empty canonical value is always preferred; legacy values only fill gaps.

DO $$
DECLARE
  pair RECORD;
BEGIN
  FOR pair IN
    SELECT * FROM (VALUES
      ('site_name',     'siteName'),
      ('logo_url',      'siteLogo'),
      ('logoUrl',       'siteLogo'),
      ('contact_email', 'contactEmail'),
      ('contact_phone', 'phone'),
      ('contactPhone',  'phone')
    ) AS pairs(legacy_key, canonical_key)
  LOOP
    INSERT INTO public.site_settings (organization_id, key, value, created_by)
    SELECT
      legacy.organization_id,
      pair.canonical_key,
      legacy.value,
      legacy.created_by
    FROM public.site_settings AS legacy
    LEFT JOIN public.site_settings AS canonical
      ON canonical.organization_id = legacy.organization_id
     AND canonical.key = pair.canonical_key
    WHERE legacy.key = pair.legacy_key
      AND legacy.value IS NOT NULL
      AND legacy.value::text NOT IN ('""', 'null')
      AND (
        canonical.organization_id IS NULL
        OR canonical.value IS NULL
        OR canonical.value::text IN ('""', 'null')
      )
    ON CONFLICT (organization_id, key) DO UPDATE
      SET value = EXCLUDED.value,
          updated_at = now();

    DELETE FROM public.site_settings WHERE key = pair.legacy_key;
  END LOOP;
END $$;
