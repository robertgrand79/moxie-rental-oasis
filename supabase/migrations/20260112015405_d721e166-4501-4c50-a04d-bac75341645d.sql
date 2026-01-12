-- Fix the copy_organization_demo_data function to use correct lifestyle_gallery columns
CREATE OR REPLACE FUNCTION public.copy_organization_demo_data(
  _source_org_id uuid,
  _target_org_id uuid,
  _created_by uuid,
  _demo_config jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _property_id_map jsonb := '{}'::jsonb;
  _new_prop_id uuid;
  _prop_record RECORD;
  _copied_counts jsonb := '{}'::jsonb;
  _prop_count int := 0;
  _blog_count int := 0;
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
        id, organization_id, title, description, location, city,
        bedrooms, bathrooms, max_guests, price_per_night,
        image_url, images, amenities, featured_photos, cover_image_url,
        display_order, airbnb_listing_url, cleaning_fee, service_fee_percentage,
        pricelabs_listing_id, latitude, longitude, calendar_export_token,
        extra_guest_fee, extra_guest_threshold, pet_fee, pet_fee_type,
        created_by, created_at, updated_at
      )
      VALUES (
        _new_prop_id, _target_org_id, _prop_record.title, _prop_record.description,
        _prop_record.location, _prop_record.city,
        _prop_record.bedrooms, _prop_record.bathrooms, _prop_record.max_guests,
        _prop_record.price_per_night, _prop_record.image_url, _prop_record.images,
        _prop_record.amenities, _prop_record.featured_photos, _prop_record.cover_image_url,
        _prop_record.display_order, _prop_record.airbnb_listing_url,
        _prop_record.cleaning_fee, _prop_record.service_fee_percentage,
        _prop_record.pricelabs_listing_id, _prop_record.latitude, _prop_record.longitude,
        gen_random_uuid()::text,
        _prop_record.extra_guest_fee, _prop_record.extra_guest_threshold,
        _prop_record.pet_fee, _prop_record.pet_fee_type,
        _created_by, now(), now()
      );
    END LOOP;
  END IF;

  -- ==========================================
  -- 2. COPY BLOG POSTS (if enabled)
  -- ==========================================
  IF COALESCE((_demo_config->>'blog_posts')::boolean, (_demo_config->>'copy_blog_posts')::boolean, true) THEN
    INSERT INTO blog_posts (
      id, organization_id, title, slug, content, excerpt, author,
      image_url, status, content_type, category, tags,
      is_featured, is_active, display_order, published_at,
      location, address, latitude, longitude, phone, website_url,
      price_range, rating, activity_type, event_date, end_date,
      time_start, time_end, is_recurring, recurrence_pattern,
      ticket_url, image_credit, metadata, created_by, created_at, updated_at
    )
    SELECT 
      gen_random_uuid(), _target_org_id, title, 
      slug || '-' || substr(gen_random_uuid()::text, 1, 8),
      content, excerpt, author, image_url, status, content_type,
      category, tags, is_featured, is_active, display_order,
      published_at, location, address, latitude, longitude, phone,
      website_url, price_range, rating, activity_type, event_date,
      end_date, time_start, time_end, is_recurring, recurrence_pattern,
      ticket_url, image_credit, metadata, _created_by, now(), now()
    FROM blog_posts
    WHERE organization_id = _source_org_id;
    
    GET DIAGNOSTICS _blog_count = ROW_COUNT;
  END IF;

  -- ==========================================
  -- 3. COPY TESTIMONIALS (if enabled)
  -- Uses actual columns: review_text, booking_platform, guest_location, guest_avatar_url, property_name
  -- ==========================================
  IF COALESCE((_demo_config->>'testimonials')::boolean, (_demo_config->>'copy_testimonials')::boolean, true) THEN
    BEGIN
      INSERT INTO testimonials (
        id, organization_id, property_id, guest_name, review_text, rating,
        booking_platform, guest_location, guest_avatar_url, property_name,
        stay_date, is_featured, is_approved, created_at, updated_at
      )
      SELECT 
        gen_random_uuid(), _target_org_id,
        CASE 
          WHEN property_id IS NOT NULL AND _property_id_map ? property_id::text 
          THEN (_property_id_map->>property_id::text)::uuid 
          ELSE NULL 
        END,
        guest_name, review_text, rating, booking_platform, guest_location,
        guest_avatar_url, property_name, stay_date, is_featured, is_approved,
        now(), now()
      FROM testimonials
      WHERE organization_id = _source_org_id;
      
      GET DIAGNOSTICS _testimonial_count = ROW_COUNT;
    EXCEPTION WHEN undefined_column THEN
      _testimonial_count := 0;
    END;
  END IF;

  -- ==========================================
  -- 4. COPY POINTS OF INTEREST (if enabled)
  -- ==========================================
  IF COALESCE((_demo_config->>'points_of_interest')::boolean, (_demo_config->>'copy_points_of_interest')::boolean, true) THEN
    BEGIN
      INSERT INTO points_of_interest (
        id, organization_id, property_id, name, category, description,
        address, latitude, longitude, distance_value, distance_unit,
        travel_time_minutes, website_url, phone, image_url,
        display_order, is_active, created_at, updated_at
      )
      SELECT 
        gen_random_uuid(), _target_org_id,
        CASE 
          WHEN property_id IS NOT NULL AND _property_id_map ? property_id::text 
          THEN (_property_id_map->>property_id::text)::uuid 
          ELSE NULL 
        END,
        name, category, description, address, latitude, longitude,
        distance_value, distance_unit, travel_time_minutes,
        website_url, phone, image_url, display_order, is_active,
        now(), now()
      FROM points_of_interest
      WHERE organization_id = _source_org_id;
      
      GET DIAGNOSTICS _poi_count = ROW_COUNT;
    EXCEPTION WHEN undefined_table THEN
      _poi_count := 0;
    END;
  END IF;

  -- ==========================================
  -- 5. COPY LIFESTYLE GALLERY (if enabled)
  -- Fixed: Using correct column names (title, description, location, activity_type, is_featured, status)
  -- ==========================================
  IF COALESCE((_demo_config->>'lifestyle_gallery')::boolean, (_demo_config->>'copy_lifestyle_gallery')::boolean, true) THEN
    BEGIN
      INSERT INTO lifestyle_gallery (
        id, organization_id, title, description, image_url,
        category, location, activity_type, display_order, 
        is_featured, is_active, status, created_by, created_at, updated_at
      )
      SELECT 
        gen_random_uuid(), _target_org_id, title, description, image_url,
        category, location, activity_type, display_order,
        is_featured, is_active, status, _created_by, now(), now()
      FROM lifestyle_gallery
      WHERE organization_id = _source_org_id;
      
      GET DIAGNOSTICS _gallery_count = ROW_COUNT;
    EXCEPTION WHEN undefined_table THEN
      _gallery_count := 0;
    END;
  END IF;

  -- ==========================================
  -- 6. COPY TURNOVER CHECKLIST TEMPLATES (if enabled)
  -- ==========================================
  IF COALESCE((_demo_config->>'checklist_templates')::boolean, (_demo_config->>'copy_checklist_templates')::boolean, true) THEN
    BEGIN
      INSERT INTO turnover_checklist_templates (
        id, organization_id, property_id, name, description,
        category, items, is_default, is_active, created_at, updated_at
      )
      SELECT 
        gen_random_uuid(), _target_org_id,
        CASE 
          WHEN property_id IS NOT NULL AND _property_id_map ? property_id::text 
          THEN (_property_id_map->>property_id::text)::uuid 
          ELSE NULL 
        END,
        name, description, category, items, is_default, is_active,
        now(), now()
      FROM turnover_checklist_templates
      WHERE organization_id = _source_org_id;
      
      GET DIAGNOSTICS _checklist_count = ROW_COUNT;
    EXCEPTION WHEN undefined_table THEN
      _checklist_count := 0;
    END;
  END IF;

  -- ==========================================
  -- 7. COPY EUGENE EVENTS (if enabled)
  -- ==========================================
  IF COALESCE((_demo_config->>'eugene_events')::boolean, (_demo_config->>'copy_eugene_events')::boolean, false) THEN
    BEGIN
      INSERT INTO eugene_events (
        id, organization_id, title, description, event_date, end_date,
        time_start, time_end, location, category, image_url,
        website_url, ticket_url, price_range, is_featured, is_active,
        is_recurring, recurrence_pattern, status, created_by, created_at, updated_at
      )
      SELECT 
        gen_random_uuid(), _target_org_id, title, description,
        event_date, end_date, time_start, time_end, location, category,
        image_url, website_url, ticket_url, price_range, is_featured,
        is_active, is_recurring, recurrence_pattern, status,
        _created_by, now(), now()
      FROM eugene_events
      WHERE organization_id = _source_org_id;
      
      GET DIAGNOSTICS _event_count = ROW_COUNT;
    EXCEPTION WHEN undefined_table THEN
      _event_count := 0;
    END;
  END IF;

  -- Build and return the result
  _copied_counts := jsonb_build_object(
    'properties', _prop_count,
    'blog_posts', _blog_count,
    'testimonials', _testimonial_count,
    'points_of_interest', _poi_count,
    'lifestyle_gallery', _gallery_count,
    'message_templates', _message_count,
    'turnover_checklists', _checklist_count,
    'eugene_events', _event_count
  );

  -- Log the copy operation
  INSERT INTO application_logs (level, message, context, tags)
  VALUES (
    'info',
    'Demo data copied successfully',
    jsonb_build_object(
      'source_org_id', _source_org_id,
      'target_org_id', _target_org_id,
      'created_by', _created_by,
      'counts', _copied_counts,
      'config', _demo_config
    ),
    ARRAY['template', 'demo-data', 'organization-creation']
  );

  RETURN _copied_counts;
END;
$function$;