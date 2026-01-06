-- Create StayMoxie Single Template organization
-- ID: b0000000-0000-0000-0000-000000000001

INSERT INTO organizations (
  id,
  name,
  slug,
  template_type,
  is_template,
  is_template_source,
  template_category,
  is_active,
  subscription_status,
  subscription_tier
) VALUES (
  'b0000000-0000-0000-0000-000000000001',
  'StayMoxie Single Template',
  'staymoxie-template-single',
  'single_property',
  true,
  true,
  'single',
  true,
  'active',
  'template'
);

-- Insert customized site_settings for single-property template
INSERT INTO site_settings (organization_id, key, value) VALUES
-- Core branding
('b0000000-0000-0000-0000-000000000001', 'site_name', '"Mountain View Retreat"'),
('b0000000-0000-0000-0000-000000000001', 'tagline', '"Your peaceful escape in the mountains"'),
('b0000000-0000-0000-0000-000000000001', 'site_description', '"A stunning 3-bedroom cabin retreat nestled in the Blue Ridge Mountains, offering breathtaking views, modern amenities, and the perfect blend of rustic charm and comfort."'),

-- Colors - warm cabin tones
('b0000000-0000-0000-0000-000000000001', 'primary_color', '"#8B5A2B"'),
('b0000000-0000-0000-0000-000000000001', 'secondary_color', '"#2F4F4F"'),
('b0000000-0000-0000-0000-000000000001', 'accent_color', '"#D2691E"'),

-- Display mode
('b0000000-0000-0000-0000-000000000001', 'display_mode', '"single_property"'),
('b0000000-0000-0000-0000-000000000001', 'show_property_list', 'false'),

-- About section - single property focused
('b0000000-0000-0000-0000-000000000001', 'aboutTitle', '"About Mountain View Retreat"'),
('b0000000-0000-0000-0000-000000000001', 'aboutTagline', '"Where mountain tranquility meets modern comfort"'),
('b0000000-0000-0000-0000-000000000001', 'aboutHeroSubtitle', '"Escape to our lovingly restored cabin, where every detail has been thoughtfully designed for your perfect mountain getaway."'),
('b0000000-0000-0000-0000-000000000001', 'aboutDescription', '"<p>Mountain View Retreat started as a dream to share the beauty of the Blue Ridge Mountains with travelers seeking a genuine escape from everyday life.</p><p><br></p><p>Our cabin has been thoughtfully renovated to blend rustic mountain charm with modern amenities. From the stone fireplace perfect for cozy evenings to the private hot tub overlooking the valley, every detail has been considered to make your stay memorable.</p><p><br></p><p>Located just 20 minutes from downtown Asheville, you''ll have easy access to world-class dining, craft breweries, and endless outdoor adventures—while enjoying the peace and privacy of your own mountain sanctuary.</p>"'),
('b0000000-0000-0000-0000-000000000001', 'aboutFounderQuote', '"We wanted to create a space where guests could disconnect from the noise of everyday life and reconnect with nature, family, and themselves."'),
('b0000000-0000-0000-0000-000000000001', 'aboutClosingQuote', '"Come experience the magic of the mountains—where every sunrise brings new wonder and every evening ends with starlit skies."'),

-- About feature cards
('b0000000-0000-0000-0000-000000000001', 'aboutFeatureCards', '[{"icon":"Mountain","title":"Mountain Views","description":"Panoramic views of the Blue Ridge from every window"},{"icon":"Flame","title":"Cozy Fireplace","description":"Gather around the stone fireplace for memorable evenings"},{"icon":"Sparkles","title":"Hot Tub","description":"Private hot tub with valley views for ultimate relaxation"},{"icon":"TreePine","title":"Nature Immersion","description":"Surrounded by forest with hiking trails nearby"}]'),

-- About values cards  
('b0000000-0000-0000-0000-000000000001', 'aboutValuesCards', '[{"icon":"Heart","title":"Personal Touch","description":"We treat every guest like family, ensuring your stay exceeds expectations."},{"icon":"Shield","title":"Quality Promise","description":"Every amenity and detail carefully maintained for your comfort."},{"icon":"Map","title":"Local Expertise","description":"Insider tips and recommendations to help you explore like a local."}]'),

-- About mission cards
('b0000000-0000-0000-0000-000000000001', 'aboutMissionCards', '[{"icon":"Mountain","title":"Outdoor Adventures","description":"From hiking the Blue Ridge Parkway to chasing waterfalls, adventure awaits just outside your door."},{"icon":"Coffee","title":"Local Flavors","description":"Explore Asheville''s renowned food and craft beer scene, just a short drive away."}]'),

-- Contact info placeholders
('b0000000-0000-0000-0000-000000000001', 'contact_email', '"hello@mountainviewretreat.com"'),
('b0000000-0000-0000-0000-000000000001', 'contact_phone', '"(828) 555-0123"'),

-- Social placeholders
('b0000000-0000-0000-0000-000000000001', 'social_instagram', '"@mountainviewretreat"'),

-- Homepage hero
('b0000000-0000-0000-0000-000000000001', 'hero_title', '"Mountain View Retreat"'),
('b0000000-0000-0000-0000-000000000001', 'hero_subtitle', '"Your peaceful escape in the Blue Ridge Mountains"'),
('b0000000-0000-0000-0000-000000000001', 'hero_cta_text', '"Check Availability"'),

-- Feature sections
('b0000000-0000-0000-0000-000000000001', 'show_testimonials', 'true'),
('b0000000-0000-0000-0000-000000000001', 'show_blog', 'true'),
('b0000000-0000-0000-0000-000000000001', 'show_local_guide', 'true'),
('b0000000-0000-0000-0000-000000000001', 'show_gallery', 'true');