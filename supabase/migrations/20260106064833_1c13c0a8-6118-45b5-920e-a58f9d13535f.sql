-- Fix the message_templates column references in create_organization_with_owner
-- The table uses 'content' not 'body', and doesn't have trigger_type/trigger_days_offset

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
  
  -- If visual_template_id provided, use it to get source org and config
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
    
    -- Validate source organization exists if demo data requested
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

  -- Copy settings and message templates from source org
  IF _source_org_id IS NOT NULL THEN
    -- Copy site_settings
    FOR _setting IN 
      SELECT key, value FROM site_settings WHERE organization_id = _source_org_id
    LOOP
      INSERT INTO site_settings (organization_id, key, value, created_by)
      VALUES (_new_org_id, _setting.key, _setting.value, _user_id)
      ON CONFLICT (organization_id, key) DO NOTHING;
    END LOOP;

    -- Copy message_templates (using correct column names: content not body)
    INSERT INTO message_templates (
      organization_id, name, subject, content, category, is_active, created_by
    )
    SELECT 
      _new_org_id, name, subject, content, category, is_active, _user_id
    FROM message_templates
    WHERE organization_id = _source_org_id AND is_active = true
    ON CONFLICT DO NOTHING;
  END IF;

  -- Copy demo data if requested
  IF _should_include_demo = true AND _source_org_id IS NOT NULL THEN
    _demo_result := copy_organization_demo_data(
      _source_org_id,
      _new_org_id,
      _user_id,
      COALESCE(_demo_config, '{}'::jsonb)
    );
  END IF;

  -- Insert default site settings (only if not already copied from source)
  INSERT INTO site_settings (organization_id, key, value, created_by)
  SELECT _new_org_id, key, value, _user_id
  FROM (VALUES
    ('siteName', to_jsonb(_name)),
    ('tagline', '"Welcome to your vacation rental"'::jsonb),
    ('description', '""'::jsonb),
    ('heroTitle', to_jsonb('Welcome to ' || _name)),
    ('heroSubtitle', '"Your perfect getaway awaits"'::jsonb),
    ('heroCTAText', '"View Properties"'::jsonb),
    ('siteLogo', '""'::jsonb),
    ('contactEmail', '""'::jsonb),
    ('phone', '""'::jsonb),
    ('address', '""'::jsonb),
    ('socialMedia', '{}'::jsonb),
    ('emailFromAddress', '""'::jsonb),
    ('emailFromName', to_jsonb(_name)),
    ('emailReplyTo', '""'::jsonb),
    ('fontPairing', '"playfair-source"'::jsonb),
    ('fontScale', '"default"'::jsonb)
  ) AS defaults(key, value)
  WHERE NOT EXISTS (
    SELECT 1 FROM site_settings 
    WHERE organization_id = _new_org_id AND site_settings.key = defaults.key
  )
  ON CONFLICT (organization_id, key) DO NOTHING;

  -- Log the template-based creation
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