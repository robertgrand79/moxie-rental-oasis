-- =====================================================
-- DROP AND RECREATE CREATE_ORGANIZATION_WITH_OWNER
-- =====================================================

-- Drop old function signature first
DROP FUNCTION IF EXISTS public.create_organization_with_owner(text, text, uuid, uuid);

-- Create new function with unified template support
CREATE OR REPLACE FUNCTION public.create_organization_with_owner(
  _name text, 
  _slug text, 
  _user_id uuid, 
  _template_id uuid DEFAULT NULL::uuid,
  _visual_template_id uuid DEFAULT NULL::uuid,
  _include_demo_data boolean DEFAULT false
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _new_org_id uuid;
  _template_type text;
  _source_org_id uuid;
  _demo_config jsonb;
  _pricing_tier_id uuid;
  _should_include_demo boolean;
  _setting record;
BEGIN
  -- ==========================================
  -- 1. RESOLVE TEMPLATE CONFIGURATION
  -- ==========================================
  _should_include_demo := _include_demo_data;
  
  -- If visual_template_id provided, use it to get source org and config
  IF _visual_template_id IS NOT NULL THEN
    SELECT 
      ot.source_organization_id,
      ot.template_type,
      ot.demo_data_config,
      ot.pricing_tier_id,
      COALESCE(_include_demo_data, ot.include_demo_data)
    INTO 
      _source_org_id,
      _template_type,
      _demo_config,
      _pricing_tier_id,
      _should_include_demo
    FROM organization_templates ot
    WHERE ot.id = _visual_template_id;
  -- Fallback to legacy template_id (organizations.is_template=true)
  ELSIF _template_id IS NOT NULL THEN
    SELECT template_type INTO _template_type FROM organizations WHERE id = _template_id;
    _source_org_id := _template_id;
    _demo_config := '{}'::jsonb;
  END IF;

  -- ==========================================
  -- 2. CREATE THE ORGANIZATION
  -- ==========================================
  INSERT INTO organizations (
    name, 
    slug, 
    template_type,
    created_from_template_id
  )
  VALUES (
    _name, 
    _slug, 
    COALESCE(_template_type, 'multi_property'),
    _visual_template_id
  )
  RETURNING id INTO _new_org_id;

  -- ==========================================
  -- 3. ADD USER AS OWNER
  -- ==========================================
  INSERT INTO organization_members (organization_id, user_id, role)
  VALUES (_new_org_id, _user_id, 'owner');

  -- Update user profile with organization
  UPDATE profiles SET organization_id = _new_org_id WHERE id = _user_id;

  -- ==========================================
  -- 4. CREATE ONBOARDING STEPS
  -- ==========================================
  INSERT INTO organization_onboarding (organization_id, step_name)
  VALUES
    (_new_org_id, 'branding'),
    (_new_org_id, 'contact'),
    (_new_org_id, 'property'),
    (_new_org_id, 'payments');

  -- ==========================================
  -- 5. COPY SETTINGS FROM SOURCE ORG
  -- ==========================================
  IF _source_org_id IS NOT NULL THEN
    -- Copy site_settings as key-value pairs
    FOR _setting IN 
      SELECT key, value 
      FROM site_settings 
      WHERE organization_id = _source_org_id
    LOOP
      INSERT INTO site_settings (organization_id, key, value, created_by)
      VALUES (_new_org_id, _setting.key, _setting.value, _user_id)
      ON CONFLICT (organization_id, key) DO NOTHING;
    END LOOP;

    -- Copy message_templates from source organization
    INSERT INTO message_templates (
      organization_id, name, subject, body, template_type,
      trigger_type, trigger_days_offset, is_active, created_by
    )
    SELECT 
      _new_org_id, name, subject, body, template_type,
      trigger_type, trigger_days_offset, is_active, _user_id
    FROM message_templates
    WHERE organization_id = _source_org_id AND is_active = true;
  END IF;

  -- ==========================================
  -- 6. COPY DEMO DATA (if enabled)
  -- ==========================================
  IF _should_include_demo = true AND _source_org_id IS NOT NULL THEN
    PERFORM copy_organization_demo_data(
      _source_org_id,
      _new_org_id,
      _user_id,
      COALESCE(_demo_config, '{}'::jsonb)
    );
  END IF;

  -- ==========================================
  -- 7. CREATE DEFAULT SETTINGS (if not copied)
  -- ==========================================
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
    SELECT 1 FROM site_settings ss 
    WHERE ss.organization_id = _new_org_id 
    AND ss.key = defaults.key
  );

  -- ==========================================
  -- 8. CREATE ASSISTANT SETTINGS
  -- ==========================================
  INSERT INTO assistant_settings (organization_id, is_enabled, display_name, welcome_message)
  VALUES (
    _new_org_id, 
    false, 
    _name || ' Assistant', 
    'Hi! I''m your AI assistant. How can I help you today?'
  )
  ON CONFLICT (organization_id) DO NOTHING;

  RETURN _new_org_id;
END;
$function$;

COMMENT ON FUNCTION public.create_organization_with_owner IS 
'Creates a new organization with owner, optionally from a visual template with demo data';