-- Update the create_organization_with_owner function to ALWAYS create site_settings
-- and use the correct key-value structure

CREATE OR REPLACE FUNCTION public.create_organization_with_owner(
  _name text, 
  _slug text, 
  _user_id uuid, 
  _template_id uuid DEFAULT NULL::uuid
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _new_org_id uuid;
  _template_type text;
  _setting record;
BEGIN
  -- Get template type if template provided
  IF _template_id IS NOT NULL THEN
    SELECT template_type INTO _template_type FROM organizations WHERE id = _template_id;
  END IF;

  -- Create the organization
  INSERT INTO organizations (name, slug, template_type)
  VALUES (_name, _slug, COALESCE(_template_type, 'multi_property'))
  RETURNING id INTO _new_org_id;

  -- Add user as owner
  INSERT INTO organization_members (organization_id, user_id, role)
  VALUES (_new_org_id, _user_id, 'owner');

  -- Update user profile with organization
  UPDATE profiles SET organization_id = _new_org_id WHERE id = _user_id;

  -- Create onboarding steps matching the UI flow
  INSERT INTO organization_onboarding (organization_id, step_name)
  VALUES
    (_new_org_id, 'branding'),
    (_new_org_id, 'contact'),
    (_new_org_id, 'property'),
    (_new_org_id, 'payments');

  -- If template provided, copy settings from template using key-value structure
  IF _template_id IS NOT NULL THEN
    -- Copy site_settings as key-value pairs
    FOR _setting IN 
      SELECT key, value 
      FROM site_settings 
      WHERE organization_id = _template_id
    LOOP
      INSERT INTO site_settings (organization_id, key, value, created_by)
      VALUES (_new_org_id, _setting.key, _setting.value, _user_id);
    END LOOP;

    -- Copy message_templates
    INSERT INTO message_templates (
      property_id, name, subject, content, category, is_active, is_default, created_by
    )
    SELECT 
      NULL, name, subject, content, category, is_active, is_default, _user_id
    FROM message_templates
    WHERE property_id IS NULL 
    AND created_by IN (SELECT user_id FROM organization_members WHERE organization_id = _template_id);
  END IF;

  -- ALWAYS create essential default settings if they don't exist
  -- These ensure the organization can function immediately
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

  -- Create assistant_settings record with defaults
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