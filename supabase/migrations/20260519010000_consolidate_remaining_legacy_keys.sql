-- Extends the consolidation from PR #27 to color/hero/description legacy keys.
--
-- Safer promotion rule than #27: promote legacy -> canonical ONLY when the
-- canonical row does not exist at all. If a canonical row exists (even if
-- empty), it represents the tenant's intentional state and is preserved.
-- This avoids resurrecting demo-template values for tenants who picked
-- the Starter template and later cleared specific canonical keys.
--
-- The legacy row is deleted unconditionally.

DO $$
DECLARE
  pair RECORD;
BEGIN
  FOR pair IN
    SELECT * FROM (VALUES
      ('primary_color',    'colorPrimary'),
      ('secondary_color',  'colorSecondary'),
      ('accent_color',     'colorAccent'),
      ('hero_title',       'heroTitle'),
      ('hero_subtitle',    'heroSubtitle'),
      ('hero_cta_text',    'heroCTAText'),
      ('site_description', 'description')
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
      AND canonical.organization_id IS NULL
    ON CONFLICT (organization_id, key) DO NOTHING;

    DELETE FROM public.site_settings WHERE key = pair.legacy_key;
  END LOOP;
END $$;
