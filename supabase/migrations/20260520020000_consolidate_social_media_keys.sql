-- Consolidate legacy social_facebook / social_instagram / social_twitter
-- keys into the canonical socialMedia JSONB object.
--
-- The Settings -> Social tab and the public Footer both work with a
-- single socialMedia JSONB object ({facebook, instagram, twitter, ...}).
-- The snake_case social_* keys are legacy: in practice they are only
-- produced by demo-template seed data (the "Mountain View Retreat"
-- template) and copied into clones by create_organization_with_owner.
-- No current code path writes them.
--
-- Promotion rule mirrors migration 20260519010000: promote legacy
-- values into socialMedia only when the canonical object is absent or
-- empty ({}), so a tenant's configured socialMedia is never clobbered.
-- Empty strings and known demo placeholder URLs (mountainviewcabin)
-- are skipped so demo data is not resurrected into the canonical key.
-- The legacy rows are deleted afterward.

DO $$
DECLARE
  rec RECORD;
  fb text;
  ig text;
  tw text;
  cb uuid;
  built jsonb;
BEGIN
  FOR rec IN
    SELECT DISTINCT organization_id
    FROM public.site_settings
    WHERE key IN ('social_facebook', 'social_instagram', 'social_twitter')
  LOOP
    SELECT created_by INTO cb FROM public.site_settings
      WHERE organization_id = rec.organization_id
        AND key IN ('social_facebook', 'social_instagram', 'social_twitter')
      LIMIT 1;

    SELECT value #>> '{}' INTO fb FROM public.site_settings
      WHERE organization_id = rec.organization_id AND key = 'social_facebook';
    SELECT value #>> '{}' INTO ig FROM public.site_settings
      WHERE organization_id = rec.organization_id AND key = 'social_instagram';
    SELECT value #>> '{}' INTO tw FROM public.site_settings
      WHERE organization_id = rec.organization_id AND key = 'social_twitter';

    IF fb IS NULL OR fb = '' OR fb ILIKE '%mountainviewcabin%' THEN fb := NULL; END IF;
    IF ig IS NULL OR ig = '' OR ig ILIKE '%mountainviewcabin%' THEN ig := NULL; END IF;
    IF tw IS NULL OR tw = '' OR tw ILIKE '%mountainviewcabin%' THEN tw := NULL; END IF;

    built := jsonb_strip_nulls(jsonb_build_object(
      'facebook', fb, 'instagram', ig, 'twitter', tw
    ));

    IF built <> '{}'::jsonb THEN
      INSERT INTO public.site_settings (organization_id, key, value, created_by)
      VALUES (rec.organization_id, 'socialMedia', built, cb)
      ON CONFLICT (organization_id, key) DO UPDATE
        SET value = built, updated_at = now()
        WHERE public.site_settings.value = '{}'::jsonb;
    END IF;
  END LOOP;

  DELETE FROM public.site_settings
  WHERE key IN ('social_facebook', 'social_instagram', 'social_twitter');
END $$;
