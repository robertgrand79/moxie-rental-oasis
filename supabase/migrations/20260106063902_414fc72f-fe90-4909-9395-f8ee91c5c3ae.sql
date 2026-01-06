-- =====================================================
-- DROP AND RECREATE COPY_ORGANIZATION_DEMO_DATA
-- =====================================================

-- Drop existing function first (changing return type)
DROP FUNCTION IF EXISTS public.copy_organization_demo_data(uuid, uuid, uuid, jsonb);

-- Create enhanced function with logging and return value
CREATE OR REPLACE FUNCTION public.copy_organization_demo_data(
  _source_org_id uuid,
  _target_org_id uuid,
  _target_user_id uuid,
  _demo_config jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _property_id_map jsonb := '{}'::jsonb;
  _new_prop_id uuid;
  _prop_record RECORD;
  _copied_counts jsonb := '{}'::jsonb;
  _prop_count int := 0;
  _blog_count int := 0;
  _page_count int := 0;
  _testimonial_count int := 0;
  _poi_count int := 0;
  _gallery_count int := 0;
  _message_count int := 0;
  _checklist_count int := 0;
  _event_count int := 0;
BEGIN
  -- Validate source org exists
  IF NOT EXISTS (SELECT 1 FROM organizations WHERE id = _source_org_id) THEN
    RAISE NOTICE 'Source organization % does not exist', _source_org_id;
    RETURN jsonb_build_object('error', 'Source organization not found', 'source_org_id', _source_org_id);
  END IF;

  -- ==========================================
  -- 1. COPY PROPERTIES (if enabled)
  -- ==========================================
  IF COALESCE((_demo_config->>'properties')::boolean, (_demo_config->>'copy_properties')::boolean, true) THEN
    FOR _prop_record IN 
      SELECT * FROM properties WHERE organization_id = _source_org_id
    LOOP
      _new_prop_id := gen_random_uuid();
      _property_id_map := _property_id_map || jsonb_build_object(_prop_record.id::text, _new_prop_id::text);
      _prop_count := _prop_count + 1;
      
      INSERT INTO properties (
        id, organization_id, name, slug, description, short_description,
        property_type, address, city, state, zip_code, country,
        latitude, longitude, bedrooms, bathrooms, max_guests,
        square_feet, base_price, cleaning_fee, currency,
        check_in_time, check_out_time, min_nights, max_nights,
        status, is_active, featured_image_url, hero_image_url,
        seo_title, seo_description, seo_keywords,
        neighborhood_description, getting_around, house_rules,
        cancellation_policy, additional_info, host_name, host_bio,
        host_image_url, created_at, updated_at
      )
      VALUES (
        _new_prop_id, _target_org_id, _prop_record.name, _prop_record.slug,
        _prop_record.description, _prop_record.short_description,
        _prop_record.property_type, _prop_record.address, _prop_record.city,
        _prop_record.state, _prop_record.zip_code, _prop_record.country,
        _prop_record.latitude, _prop_record.longitude, _prop_record.bedrooms,
        _prop_record.bathrooms, _prop_record.max_guests, _prop_record.square_feet,
        _prop_record.base_price, _prop_record.cleaning_fee, _prop_record.currency,
        _prop_record.check_in_time, _prop_record.check_out_time,
        _prop_record.min_nights, _prop_record.max_nights,
        'active', true, _prop_record.featured_image_url, _prop_record.hero_image_url,
        _prop_record.seo_title, _prop_record.seo_description, _prop_record.seo_keywords,
        _prop_record.neighborhood_description, _prop_record.getting_around,
        _prop_record.house_rules, _prop_record.cancellation_policy,
        _prop_record.additional_info, _prop_record.host_name, _prop_record.host_bio,
        _prop_record.host_image_url, now(), now()
      );
      
      -- Copy property images
      INSERT INTO property_images (
        id, property_id, organization_id, image_url, alt_text,
        category, display_order, is_primary, created_at
      )
      SELECT 
        gen_random_uuid(), _new_prop_id, _target_org_id, image_url, alt_text,
        category, display_order, is_primary, now()
      FROM property_images 
      WHERE property_id = _prop_record.id;
      
      -- Copy property amenities
      INSERT INTO property_amenities (
        id, property_id, organization_id, amenity_id, custom_label,
        custom_description, display_order, created_at
      )
      SELECT 
        gen_random_uuid(), _new_prop_id, _target_org_id, amenity_id, custom_label,
        custom_description, display_order, now()
      FROM property_amenities 
      WHERE property_id = _prop_record.id;
      
      -- Copy property spaces/rooms
      INSERT INTO property_spaces (
        id, property_id, organization_id, space_type, name,
        description, display_order, created_at
      )
      SELECT 
        gen_random_uuid(), _new_prop_id, _target_org_id, space_type, name,
        description, display_order, now()
      FROM property_spaces 
      WHERE property_id = _prop_record.id;
    END LOOP;
  END IF;

  -- ==========================================
  -- 2. COPY BLOG POSTS (if enabled)
  -- ==========================================
  IF COALESCE((_demo_config->>'blog_posts')::boolean, (_demo_config->>'copy_blog_posts')::boolean, true) THEN
    WITH inserted AS (
      INSERT INTO blog_posts (
        id, organization_id, title, slug, content, excerpt,
        author, image_url, status, category, tags,
        content_type, is_featured, is_active, created_by, created_at, updated_at
      )
      SELECT 
        gen_random_uuid(), _target_org_id, title, slug, content, excerpt,
        author, image_url, 'draft', category, tags,
        content_type, is_featured, true, _target_user_id, now(), now()
      FROM blog_posts 
      WHERE organization_id = _source_org_id AND is_active = true
      RETURNING id
    )
    SELECT COUNT(*) INTO _blog_count FROM inserted;
  END IF;

  -- ==========================================
  -- 3. COPY STATIC PAGES (if enabled)
  -- ==========================================
  IF COALESCE((_demo_config->>'pages')::boolean, (_demo_config->>'copy_pages')::boolean, true) THEN
    WITH inserted AS (
      INSERT INTO static_pages (
        id, organization_id, title, slug, content, meta_title,
        meta_description, is_published, display_order, created_by, created_at, updated_at
      )
      SELECT 
        gen_random_uuid(), _target_org_id, title, slug, content, meta_title,
        meta_description, false, display_order, _target_user_id, now(), now()
      FROM static_pages 
      WHERE organization_id = _source_org_id
      RETURNING id
    )
    SELECT COUNT(*) INTO _page_count FROM inserted;
  END IF;

  -- ==========================================
  -- 4. COPY TESTIMONIALS (if enabled)
  -- ==========================================
  IF COALESCE((_demo_config->>'testimonials')::boolean, (_demo_config->>'copy_testimonials')::boolean, true) THEN
    WITH inserted AS (
      INSERT INTO testimonials (
        id, organization_id, guest_name, guest_location, content,
        rating, stay_date, is_featured, is_active, display_order, created_at
      )
      SELECT 
        gen_random_uuid(), _target_org_id, guest_name, guest_location, content,
        rating, stay_date, is_featured, true, display_order, now()
      FROM testimonials 
      WHERE organization_id = _source_org_id AND is_active = true
      RETURNING id
    )
    SELECT COUNT(*) INTO _testimonial_count FROM inserted;
  END IF;

  -- ==========================================
  -- 5. COPY POINTS OF INTEREST (if enabled)
  -- ==========================================
  IF COALESCE((_demo_config->>'points_of_interest')::boolean, (_demo_config->>'copy_points_of_interest')::boolean, true) THEN
    WITH inserted AS (
      INSERT INTO points_of_interest (
        id, organization_id, name, category, description, address,
        latitude, longitude, distance_miles, drive_time_minutes,
        rating, website_url, phone, image_url, is_featured,
        is_active, display_order, created_at
      )
      SELECT 
        gen_random_uuid(), _target_org_id, name, category, description, address,
        latitude, longitude, distance_miles, drive_time_minutes,
        rating, website_url, phone, image_url, is_featured,
        true, display_order, now()
      FROM points_of_interest 
      WHERE organization_id = _source_org_id AND is_active = true
      RETURNING id
    )
    SELECT COUNT(*) INTO _poi_count FROM inserted;
  END IF;

  -- ==========================================
  -- 6. COPY LIFESTYLE GALLERY (if enabled)
  -- ==========================================
  IF COALESCE((_demo_config->>'lifestyle_gallery')::boolean, (_demo_config->>'copy_lifestyle_gallery')::boolean, true) THEN
    WITH inserted AS (
      INSERT INTO lifestyle_gallery (
        id, organization_id, title, description, image_url,
        category, display_order, is_active, created_at
      )
      SELECT 
        gen_random_uuid(), _target_org_id, title, description, image_url,
        category, display_order, true, now()
      FROM lifestyle_gallery 
      WHERE organization_id = _source_org_id AND is_active = true
      RETURNING id
    )
    SELECT COUNT(*) INTO _gallery_count FROM inserted;
  END IF;

  -- ==========================================
  -- 7. COPY MESSAGE TEMPLATES (if enabled)
  -- ==========================================
  IF COALESCE((_demo_config->>'message_templates')::boolean, (_demo_config->>'copy_message_templates')::boolean, true) THEN
    WITH inserted AS (
      INSERT INTO message_templates (
        id, organization_id, name, subject, body, template_type,
        trigger_type, trigger_days_offset, is_active, created_by, created_at
      )
      SELECT 
        gen_random_uuid(), _target_org_id, name, subject, body, template_type,
        trigger_type, trigger_days_offset, true, _target_user_id, now()
      FROM message_templates 
      WHERE organization_id = _source_org_id AND is_active = true
      RETURNING id
    )
    SELECT COUNT(*) INTO _message_count FROM inserted;
  END IF;

  -- ==========================================
  -- 8. COPY CHECKLIST TEMPLATES (if enabled)
  -- ==========================================
  IF COALESCE((_demo_config->>'checklist_templates')::boolean, (_demo_config->>'copy_checklist_templates')::boolean, true) THEN
    WITH inserted AS (
      INSERT INTO maintenance_checklist_templates (
        id, organization_id, name, description, is_active, created_by, created_at
      )
      SELECT 
        gen_random_uuid(), _target_org_id, name, description, true, _target_user_id, now()
      FROM maintenance_checklist_templates 
      WHERE organization_id = _source_org_id AND is_active = true
      RETURNING id
    )
    SELECT COUNT(*) INTO _checklist_count FROM inserted;
  END IF;

  -- ==========================================
  -- 9. COPY EVENTS (if enabled)
  -- ==========================================
  IF COALESCE((_demo_config->>'events')::boolean, (_demo_config->>'copy_events')::boolean, false) THEN
    WITH inserted AS (
      INSERT INTO eugene_events (
        id, organization_id, title, description, location,
        event_date, end_date, time_start, time_end,
        category, image_url, ticket_url, website_url,
        price_range, is_featured, is_active, status, created_at
      )
      SELECT 
        gen_random_uuid(), _target_org_id, title, description, location,
        CURRENT_DATE + (event_date - CURRENT_DATE) + interval '30 days',
        CASE WHEN end_date IS NOT NULL 
          THEN CURRENT_DATE + (end_date - CURRENT_DATE) + interval '30 days'
          ELSE NULL 
        END,
        time_start, time_end, category, image_url, ticket_url, website_url,
        price_range, is_featured, true, 'published', now()
      FROM eugene_events 
      WHERE organization_id = _source_org_id AND is_active = true
      RETURNING id
    )
    SELECT COUNT(*) INTO _event_count FROM inserted;
  END IF;

  -- Build summary
  _copied_counts := jsonb_build_object(
    'properties', _prop_count,
    'blog_posts', _blog_count,
    'pages', _page_count,
    'testimonials', _testimonial_count,
    'points_of_interest', _poi_count,
    'lifestyle_gallery', _gallery_count,
    'message_templates', _message_count,
    'checklist_templates', _checklist_count,
    'events', _event_count,
    'source_org_id', _source_org_id,
    'target_org_id', _target_org_id
  );

  -- Log the copy operation
  INSERT INTO application_logs (level, message, context, tags)
  VALUES (
    'info',
    'Demo data copied from template',
    jsonb_build_object(
      'source_org_id', _source_org_id,
      'target_org_id', _target_org_id,
      'user_id', _target_user_id,
      'config', _demo_config,
      'copied', _copied_counts
    ),
    ARRAY['template', 'demo-data', 'organization-creation']
  );

  RETURN _copied_counts;
END;
$$;

GRANT EXECUTE ON FUNCTION public.copy_organization_demo_data TO authenticated;

COMMENT ON FUNCTION public.copy_organization_demo_data IS 
'Copies demo data from source organization to target based on config. Returns summary of copied items.';


-- =====================================================
-- ENHANCED CREATE_ORGANIZATION_WITH_OWNER WITH LOGGING
-- =====================================================

DROP FUNCTION IF EXISTS public.create_organization_with_owner(text, text, uuid, uuid);
DROP FUNCTION IF EXISTS public.create_organization_with_owner(text, text, uuid, uuid, uuid, boolean);

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

  IF _source_org_id IS NOT NULL THEN
    FOR _setting IN 
      SELECT key, value FROM site_settings WHERE organization_id = _source_org_id
    LOOP
      INSERT INTO site_settings (organization_id, key, value, created_by)
      VALUES (_new_org_id, _setting.key, _setting.value, _user_id)
      ON CONFLICT (organization_id, key) DO NOTHING;
    END LOOP;

    INSERT INTO message_templates (
      organization_id, name, subject, body, template_type,
      trigger_type, trigger_days_offset, is_active, created_by
    )
    SELECT 
      _new_org_id, name, subject, body, template_type,
      trigger_type, trigger_days_offset, is_active, _user_id
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

  INSERT INTO assistant_settings (organization_id, is_enabled, display_name, welcome_message)
  VALUES (
    _new_org_id, 
    false, 
    _name || ' Assistant', 
    'Hi! I''m your AI assistant. How can I help you today?'
  )
  ON CONFLICT (organization_id) DO NOTHING;

  INSERT INTO application_logs (level, message, context, tags)
  VALUES (
    'info',
    'Organization created from template',
    jsonb_build_object(
      'org_id', _new_org_id,
      'org_name', _name,
      'slug', _slug,
      'user_id', _user_id,
      'visual_template_id', _visual_template_id,
      'template_name', _template_name,
      'pricing_tier', _pricing_tier_name,
      'source_org_id', _source_org_id,
      'include_demo_data', _should_include_demo,
      'demo_result', _demo_result
    ),
    ARRAY['organization', 'creation', 'template']
  );

  RETURN _new_org_id;
END;
$function$;

COMMENT ON FUNCTION public.create_organization_with_owner IS 
'Creates a new organization with owner, optionally from a visual template with demo data. Logs all operations.';