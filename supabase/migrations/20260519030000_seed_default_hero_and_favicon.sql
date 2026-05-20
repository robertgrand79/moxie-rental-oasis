-- Add heroBackgroundImage and favicon defaults to the signup seed.
--
-- Background: HeroBackground.tsx gracefully degrades to a CSS gradient
-- when heroBackgroundImage is empty, so a fresh signup isn't broken --
-- but the gradient looks unfinished. Pointing the seed at a generic
-- landscape SVG shipped in public/ gives the fresh tenant a real-looking
-- hero from minute one. Same idea for favicon (which would otherwise
-- inherit the build's default Vite icon).
--
-- These are static assets in public/, so the URLs work across any
-- subdomain or custom domain the tenant uses. Existing tenants are
-- intentionally NOT backfilled -- they have established hero state
-- that we shouldn't overwrite.

CREATE OR REPLACE FUNCTION public.create_organization_with_owner(
  _name text,
  _slug text,
  _user_id uuid,
  _template_id uuid DEFAULT NULL,
  _visual_template_id uuid DEFAULT NULL,
  _include_demo_data boolean DEFAULT false
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _new_org_id uuid;
  _template_type text;
  _source_org_id uuid;
  _demo_config jsonb;
  _pricing_tier_id uuid;
  _pricing_tier_name text;
  _should_include_demo boolean;
  _setting record;
  _demo_result jsonb;
  _template_name text;
BEGIN
  _should_include_demo := _include_demo_data;

  IF _visual_template_id IS NOT NULL THEN
    SELECT
      ot.source_organization_id,
      ot.template_type,
      ot.demo_data_config,
      ot.pricing_tier_id,
      ot.name,
      COALESCE(_include_demo_data, ot.include_demo_data)
    INTO
      _source_org_id,
      _template_type,
      _demo_config,
      _pricing_tier_id,
      _template_name,
      _should_include_demo
    FROM organization_templates ot
    WHERE ot.id = _visual_template_id;

    IF _should_include_demo AND _source_org_id IS NOT NULL THEN
      IF NOT EXISTS (SELECT 1 FROM organizations WHERE id = _source_org_id) THEN
        INSERT INTO application_logs (level, message, context, tags)
        VALUES (
          'warn',
          'Template source organization not found, skipping demo data',
          jsonb_build_object(
            'visual_template_id', _visual_template_id,
            'source_org_id', _source_org_id,
            'template_name', _template_name
          ),
          ARRAY['template', 'warning', 'organization-creation']
        );
        _should_include_demo := false;
      END IF;
    END IF;

    IF _pricing_tier_id IS NOT NULL THEN
      SELECT name INTO _pricing_tier_name FROM site_templates WHERE id = _pricing_tier_id;
    END IF;
  ELSIF _template_id IS NOT NULL THEN
    SELECT template_type INTO _template_type FROM organizations WHERE id = _template_id;
    _source_org_id := _template_id;
    _demo_config := '{}'::jsonb;
  END IF;

  INSERT INTO organizations (name, slug, template_type, created_from_template_id)
  VALUES (_name, _slug, COALESCE(_template_type, 'multi_property'), _visual_template_id)
  RETURNING id INTO _new_org_id;

  INSERT INTO organization_members (organization_id, user_id, role)
  VALUES (_new_org_id, _user_id, 'owner');

  UPDATE profiles SET organization_id = _new_org_id WHERE id = _user_id;

  INSERT INTO organization_onboarding (organization_id, step_name)
  VALUES
    (_new_org_id, 'branding'),
    (_new_org_id, 'contact'),
    (_new_org_id, 'property'),
    (_new_org_id, 'payments');

  IF _source_org_id IS NOT NULL THEN
    FOR _setting IN
      SELECT key, value FROM site_settings WHERE organization_id = _source_org_id
    LOOP
      INSERT INTO site_settings (organization_id, key, value, created_by)
      VALUES (_new_org_id, _setting.key, _setting.value, _user_id)
      ON CONFLICT (organization_id, key) DO NOTHING;
    END LOOP;

    INSERT INTO message_templates (
      organization_id, name, subject, content, category, is_active, created_by
    )
    SELECT
      _new_org_id, name, subject, content, category, is_active, _user_id
    FROM message_templates
    WHERE organization_id = _source_org_id AND is_active = true
    ON CONFLICT DO NOTHING;
  END IF;

  IF _should_include_demo = true AND _source_org_id IS NOT NULL THEN
    _demo_result := copy_organization_demo_data(
      _source_org_id,
      _new_org_id,
      _user_id,
      COALESCE(_demo_config, '{}'::jsonb)
    );
  END IF;

  INSERT INTO site_settings (organization_id, key, value, created_by)
  SELECT _new_org_id, key, value, _user_id
  FROM (VALUES
    ('siteName', to_jsonb(_name)),
    ('tagline', '"Welcome to your vacation rental"'::jsonb),
    ('description', '""'::jsonb),
    ('heroTitle', to_jsonb('Welcome to ' || _name)),
    ('heroSubtitle', '"Your perfect getaway awaits"'::jsonb),
    ('heroCTAText', '"View Properties"'::jsonb),
    ('heroBackgroundImage', '"/default-hero.svg"'::jsonb),
    ('siteLogo', '""'::jsonb),
    ('favicon', '"/default-favicon.svg"'::jsonb),
    ('contactEmail', '""'::jsonb),
    ('phone', '""'::jsonb),
    ('address', '""'::jsonb),
    ('socialMedia', '{}'::jsonb),
    ('emailFromAddress', '""'::jsonb),
    ('emailFromName', to_jsonb(_name)),
    ('emailReplyTo', '""'::jsonb),
    ('fontPairing', '"playfair-source"'::jsonb),
    ('fontScale', '"default"'::jsonb),
    ('colorPrimary', '"#8B5A2B"'::jsonb),
    ('colorSecondary', '"#2F4F4F"'::jsonb),
    ('colorAccent', '"#D2691E"'::jsonb),
    ('metaDescription', to_jsonb('Welcome to ' || _name || ' — your perfect getaway.')),
    ('ogTitle', to_jsonb(_name)),
    ('ogDescription', to_jsonb('Welcome to ' || _name || ' — your perfect getaway.'))
  ) AS defaults(key, value)
  WHERE NOT EXISTS (
    SELECT 1 FROM site_settings
    WHERE organization_id = _new_org_id AND site_settings.key = defaults.key
  )
  ON CONFLICT (organization_id, key) DO NOTHING;

  INSERT INTO application_logs (level, message, context, tags)
  VALUES (
    'info',
    'Organization created from template',
    jsonb_build_object(
      'organization_id', _new_org_id,
      'organization_name', _name,
      'visual_template_id', _visual_template_id,
      'template_name', _template_name,
      'source_org_id', _source_org_id,
      'pricing_tier_id', _pricing_tier_id,
      'pricing_tier_name', _pricing_tier_name,
      'include_demo_data', _should_include_demo,
      'demo_config', _demo_config
    ),
    ARRAY['template', 'organization-creation', 'info']
  );

  RETURN _new_org_id;
END;
$$;
