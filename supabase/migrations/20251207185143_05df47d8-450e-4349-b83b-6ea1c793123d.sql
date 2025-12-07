-- Add template_type column to organizations
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS template_type text DEFAULT 'multi_property';

-- Add comment for documentation
COMMENT ON COLUMN organizations.template_type IS 'Type of site: multi_property or single_property';

-- Update the create_organization_with_owner function to copy template_type
CREATE OR REPLACE FUNCTION public.create_organization_with_owner(
  _name text,
  _slug text,
  _user_id uuid,
  _template_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _new_org_id uuid;
  _template_type text;
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

  -- Create onboarding steps
  INSERT INTO organization_onboarding (organization_id, step_name)
  VALUES
    (_new_org_id, 'branding'),
    (_new_org_id, 'property'),
    (_new_org_id, 'settings'),
    (_new_org_id, 'launch');

  -- If template provided, duplicate settings
  IF _template_id IS NOT NULL THEN
    -- Copy site_settings
    INSERT INTO site_settings (
      organization_id, site_name, tagline, description, contact_email, 
      contact_phone, address, hero_title, hero_subtitle, primary_color, 
      secondary_color, logo_url, favicon_url, social_links, custom_css, 
      custom_scripts, seo_title, seo_description, seo_keywords, enable_blog, 
      enable_reviews, enable_bookings
    )
    SELECT 
      _new_org_id, site_name, tagline, description, contact_email,
      contact_phone, address, hero_title, hero_subtitle, primary_color,
      secondary_color, logo_url, favicon_url, social_links, custom_css,
      custom_scripts, seo_title, seo_description, seo_keywords, enable_blog,
      enable_reviews, enable_bookings
    FROM site_settings
    WHERE organization_id = _template_id
    LIMIT 1;

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

  RETURN _new_org_id;
END;
$$;