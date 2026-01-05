-- =====================================================
-- COPY ORGANIZATION DEMO DATA FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION public.copy_organization_demo_data(
  _source_org_id uuid,
  _target_org_id uuid,
  _target_user_id uuid,
  _demo_config jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _property_id_map jsonb := '{}'::jsonb;
  _old_prop_id uuid;
  _new_prop_id uuid;
  _prop_record RECORD;
BEGIN
  -- ==========================================
  -- 1. COPY PROPERTIES (if enabled)
  -- ==========================================
  IF COALESCE((_demo_config->>'copy_properties')::boolean, true) THEN
    FOR _prop_record IN 
      SELECT * FROM properties WHERE organization_id = _source_org_id
    LOOP
      _new_prop_id := gen_random_uuid();
      _property_id_map := _property_id_map || jsonb_build_object(_prop_record.id::text, _new_prop_id::text);
      
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
  IF COALESCE((_demo_config->>'copy_blog_posts')::boolean, true) THEN
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
    WHERE organization_id = _source_org_id AND is_active = true;
  END IF;

  -- ==========================================
  -- 3. COPY STATIC PAGES (if enabled)
  -- ==========================================
  IF COALESCE((_demo_config->>'copy_pages')::boolean, true) THEN
    INSERT INTO static_pages (
      id, organization_id, title, slug, content, meta_title,
      meta_description, is_published, display_order, created_by, created_at, updated_at
    )
    SELECT 
      gen_random_uuid(), _target_org_id, title, slug, content, meta_title,
      meta_description, false, display_order, _target_user_id, now(), now()
    FROM static_pages 
    WHERE organization_id = _source_org_id;
  END IF;

  -- ==========================================
  -- 4. COPY TESTIMONIALS (if enabled)
  -- ==========================================
  IF COALESCE((_demo_config->>'copy_testimonials')::boolean, true) THEN
    INSERT INTO testimonials (
      id, organization_id, guest_name, guest_location, content,
      rating, stay_date, is_featured, is_active, display_order, created_at
    )
    SELECT 
      gen_random_uuid(), _target_org_id, guest_name, guest_location, content,
      rating, stay_date, is_featured, true, display_order, now()
    FROM testimonials 
    WHERE organization_id = _source_org_id AND is_active = true;
  END IF;

  -- ==========================================
  -- 5. COPY POINTS OF INTEREST (if enabled)
  -- ==========================================
  IF COALESCE((_demo_config->>'copy_points_of_interest')::boolean, true) THEN
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
    WHERE organization_id = _source_org_id AND is_active = true;
  END IF;

  -- ==========================================
  -- 6. COPY LIFESTYLE GALLERY (if enabled)
  -- ==========================================
  IF COALESCE((_demo_config->>'copy_lifestyle_gallery')::boolean, true) THEN
    INSERT INTO lifestyle_gallery (
      id, organization_id, title, description, image_url,
      category, display_order, is_active, created_at
    )
    SELECT 
      gen_random_uuid(), _target_org_id, title, description, image_url,
      category, display_order, true, now()
    FROM lifestyle_gallery 
    WHERE organization_id = _source_org_id AND is_active = true;
  END IF;

  -- ==========================================
  -- 7. COPY MESSAGE TEMPLATES (if enabled)
  -- ==========================================
  IF COALESCE((_demo_config->>'copy_message_templates')::boolean, true) THEN
    INSERT INTO message_templates (
      id, organization_id, name, subject, body, template_type,
      trigger_type, trigger_days_offset, is_active, created_by, created_at
    )
    SELECT 
      gen_random_uuid(), _target_org_id, name, subject, body, template_type,
      trigger_type, trigger_days_offset, true, _target_user_id, now()
    FROM message_templates 
    WHERE organization_id = _source_org_id AND is_active = true;
  END IF;

  -- ==========================================
  -- 8. COPY CHECKLIST TEMPLATES (if enabled)
  -- ==========================================
  IF COALESCE((_demo_config->>'copy_checklist_templates')::boolean, true) THEN
    INSERT INTO maintenance_checklist_templates (
      id, organization_id, name, description, is_active, created_by, created_at
    )
    SELECT 
      gen_random_uuid(), _target_org_id, name, description, true, _target_user_id, now()
    FROM maintenance_checklist_templates 
    WHERE organization_id = _source_org_id AND is_active = true;
  END IF;

  -- ==========================================
  -- 9. COPY EVENTS (if enabled) - with future dates
  -- ==========================================
  IF COALESCE((_demo_config->>'copy_events')::boolean, true) THEN
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
    WHERE organization_id = _source_org_id AND is_active = true;
  END IF;

END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.copy_organization_demo_data TO authenticated;

COMMENT ON FUNCTION public.copy_organization_demo_data IS 
'Copies demo data from source organization to target based on config';