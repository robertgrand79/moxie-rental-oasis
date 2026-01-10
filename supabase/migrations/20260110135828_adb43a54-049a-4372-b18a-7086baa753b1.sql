
-- Fully populate StayMoxie Single Template with complete demo data
-- Organization ID: b0000000-0000-0000-0000-000000000001

-- 1. ADD TESTIMONIALS (5 guest reviews)
INSERT INTO testimonials (organization_id, guest_name, guest_location, rating, review_text, stay_date, is_featured, is_active, property_id)
SELECT 
  'b0000000-0000-0000-0000-000000000001',
  guest_name,
  guest_location,
  rating,
  review_text,
  stay_date,
  is_featured,
  true,
  (SELECT id FROM properties WHERE organization_id = 'b0000000-0000-0000-0000-000000000001' LIMIT 1)
FROM (VALUES
  ('Sarah & Michael', 'Denver, CO', 5, 
   'Our anniversary weekend was absolutely magical. The sunrise views from the deck took our breath away, and the hot tub under the stars was the perfect way to end each day. We''ll definitely be back!',
   '2025-10-15'::date, true),
  ('The Johnson Family', 'Dallas, TX', 5,
   'Best family vacation ever! The kids loved exploring the hiking trails and playing board games by the fireplace. The cabin had everything we needed and more - a fully stocked kitchen, comfortable beds, and those incredible mountain views.',
   '2025-08-22'::date, true),
  ('David Chen', 'Chicago, IL', 4,
   'Beautiful cabin with amazing views. The fireplace made our evenings so cozy, and the location was perfect for day trips. Only wish the WiFi was a bit faster for remote work, but honestly we didn''t want to work anyway!',
   '2025-09-10'::date, false),
  ('Jennifer Martinez', 'Phoenix, AZ', 5,
   'This is our third time staying at Mountain View Cabin and it never disappoints. Each season brings something new - fall colors, winter snow, summer wildflowers. Already planning our next trip!',
   '2025-11-05'::date, true),
  ('Mark & Lisa Thompson', 'Seattle, WA', 5,
   'The attention to detail is incredible. From the fully stocked kitchen with quality cookware to the premium bedding and luxurious towels, everything exceeded our expectations. The hot tub maintenance was impeccable too!',
   '2025-07-18'::date, false)
) AS t(guest_name, guest_location, rating, review_text, stay_date, is_featured);

-- 2. ADD LOCAL EVENTS (6 events)
INSERT INTO eugene_events (organization_id, title, description, event_date, end_date, location, category, is_recurring, recurrence_pattern, time_start, time_end, status, is_active, is_featured)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Blue River Farmers Market', 'Fresh local produce, artisan crafts, baked goods, and live music every Saturday morning. Meet local farmers and craftspeople while enjoying the mountain air.', '2026-01-11', NULL, 'Downtown Blue River, Main Street', 'community', true, 'weekly', '08:00', '13:00', 'published', true, true),
  ('b0000000-0000-0000-0000-000000000001', 'Mountain Music & Arts Festival', 'Annual celebration of mountain culture featuring live bluegrass, folk, and Americana music. Local artists, food vendors, craft beer garden, and family activities.', '2026-07-17', '2026-07-19', 'Blue River Amphitheater', 'festival', false, NULL, '11:00', '22:00', 'published', true, true),
  ('b0000000-0000-0000-0000-000000000001', 'Fall Foliage Photography Tour', 'Guided photography tours through the most scenic fall color spots. All skill levels welcome. Local photographers share their favorite hidden viewpoints.', '2026-10-03', '2026-10-25', 'Various locations - Meet at Visitor Center', 'outdoor', true, 'weekly', '06:30', '10:30', 'published', true, false),
  ('b0000000-0000-0000-0000-000000000001', 'Holiday Lights Celebration', 'Annual tree lighting ceremony with hot cocoa, carolers, visits with Santa, and thousands of twinkling lights throughout downtown. A cherished mountain tradition.', '2026-12-05', NULL, 'Town Square, Blue River', 'holiday', false, NULL, '17:00', '21:00', 'published', true, true),
  ('b0000000-0000-0000-0000-000000000001', 'Dark Sky Stargazing Night', 'Join local astronomers for guided stargazing at our certified Dark Sky location. Telescopes provided. Learn about constellations, planets, and deep-sky objects.', '2026-02-07', NULL, 'Mountain View Observatory Point', 'outdoor', true, 'monthly', '20:00', '23:00', 'published', true, false),
  ('b0000000-0000-0000-0000-000000000001', 'Annual Wildflower Festival', 'Celebrate the spectacular mountain wildflower bloom with guided hikes, botanical workshops, plein air painting, and a native plant sale. Peak bloom typically mid-June.', '2026-06-13', '2026-06-14', 'Alpine Meadows Trailhead', 'outdoor', false, NULL, '09:00', '17:00', 'published', true, true);

-- 3. ADD MESSAGE TEMPLATES (5 templates) - using correct schema
INSERT INTO message_templates (organization_id, name, subject, content, category, is_active)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Booking Confirmation', 'Your Mountain View Cabin Reservation is Confirmed!', E'Dear {{guest_name}},\n\nThank you for choosing Mountain View Cabin for your upcoming getaway! We''re thrilled to host you.\n\n**Reservation Details:**\n- Check-in: {{check_in_date}} at 4:00 PM\n- Check-out: {{check_out_date}} at 11:00 AM\n- Guests: {{guest_count}}\n\n**What''s Included:**\n✓ Fully equipped kitchen\n✓ Private hot tub\n✓ High-speed WiFi\n✓ Smart TV with streaming\n✓ Board games & books\n\nWe''ll send you detailed check-in instructions 2 days before your arrival.\n\nQuestions? Reply to this email anytime!\n\nWarm regards,\nThe Mountain View Cabin Team', 'booking', true),
  ('b0000000-0000-0000-0000-000000000001', 'Pre-Arrival Check-in Details', 'Getting Ready for Your Stay - Check-in Details', E'Hi {{guest_name}},\n\nYour mountain adventure is almost here! Here''s everything you need for a smooth arrival.\n\n**Check-in Instructions:**\nYour door code is: {{access_code}}\nAddress: {{property_address}}\n\n**Arrival Tips:**\n1. The driveway is steep - 4WD recommended in winter\n2. Look for the cabin with the red door\n3. Your code activates at 4:00 PM on {{check_in_date}}\n\n**Don''t Miss:**\n- Sunset from the upper deck (around 7:30 PM this time of year)\n- The trail behind the cabin leads to a waterfall (15 min walk)\n- We left some local coffee and treats in the kitchen!\n\nSafe travels!\nThe Mountain View Cabin Team', 'pre_arrival', true),
  ('b0000000-0000-0000-0000-000000000001', 'Welcome Message', 'Welcome to Mountain View Cabin!', E'Welcome, {{guest_name}}!\n\nWe hope you''ve settled in and are already enjoying those views! A few things to make your stay even better:\n\n**House Favorites:**\n☕ Local coffee in the pantry\n🛁 Extra towels in the hall closet\n📚 Check out our curated book collection\n🎮 Board games under the TV console\n\n**Hot Tub Tips:**\n- Controls on the right side\n- Already heated to 102°F\n- Best enjoyed under the stars!\n\n**Need Anything?**\nJust reply to this message - we typically respond within an hour.\n\nEnjoy your mountain escape!\nYour Hosts', 'welcome', true),
  ('b0000000-0000-0000-0000-000000000001', 'Mid-Stay Check-in', 'How''s Your Stay Going?', E'Hi {{guest_name}},\n\nHope you''re having an amazing time at the cabin! Just checking in to see if there''s anything you need.\n\n**Quick Questions:**\n- Is everything working well?\n- Need any recommendations for restaurants or activities?\n- Any issues we can help with?\n\n**Popular Guest Activities:**\n🥾 Eagle Peak Trail (moderate, 3 hours)\n🍕 Mario''s Italian - best pizza in town\n🛶 Blue River Kayak Rentals\n🍺 Mountain Brewing Co - great local beers\n\nDon''t hesitate to reach out!\n\nBest,\nThe Mountain View Cabin Team', 'mid_stay', true),
  ('b0000000-0000-0000-0000-000000000001', 'Checkout Reminder', 'Thank You for Staying! See You Again Soon', E'Good morning, {{guest_name}}!\n\nWe hope you had a wonderful stay at Mountain View Cabin. Today is checkout day - here''s a quick reminder:\n\n**Checkout Time:** 11:00 AM\n\n**Before You Go:**\n✓ Start the dishwasher if dishes are used\n✓ Place towels in the bathtub\n✓ Turn off lights & thermostat to 65°F\n✓ Lock all doors (they auto-lock after you leave)\n✓ No need to strip beds - we''ve got it!\n\n**Left Something Behind?**\nJust let us know and we''ll ship it to you.\n\n**Loved Your Stay?**\nWe''d be so grateful for a review!\n\nThank you for being such wonderful guests. We''d love to host you again!\n\nSafe travels,\nThe Mountain View Cabin Team\n\nP.S. Use code RETURNGUEST for 10% off your next booking!', 'checkout', true);

-- 4. UPDATE BLOG POSTS TO PUBLISHED
UPDATE blog_posts
SET 
  status = 'published',
  published_at = NOW() - INTERVAL '7 days',
  content = '<h2>Making the Most of Your Mountain Getaway</h2>
<p>A stay at Mountain View Cabin is not just accommodation - it is an experience. Here is how to make every moment count.</p>
<h3>Morning Rituals</h3>
<p>Wake up slowly with coffee on the deck. Watch the morning mist rise from the valley below. This is why you came here - do not rush it.</p>
<h3>Afternoon Adventures</h3>
<p>Whether you are hiking to hidden waterfalls, browsing the Saturday farmers market, or simply reading by the fire, let the mountain pace guide you.</p>
<h3>Evening Magic</h3>
<p>As the sun sets, fire up the hot tub and watch the stars emerge. On clear nights, you can see the Milky Way stretch across the sky.</p>',
  category = 'travel-tips'
WHERE organization_id = 'b0000000-0000-0000-0000-000000000001' AND status = 'draft';

-- 5. ADD CONTACT AND HERO SITE SETTINGS
INSERT INTO site_settings (organization_id, key, value)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'contact_email', '"hello@mountainviewcabin.com"'),
  ('b0000000-0000-0000-0000-000000000001', 'contact_phone', '"(555) 123-CABIN"'),
  ('b0000000-0000-0000-0000-000000000001', 'contact_address', '"Blue River, Colorado 80424"'),
  ('b0000000-0000-0000-0000-000000000001', 'heroTitle', '"Your Mountain Escape Awaits"'),
  ('b0000000-0000-0000-0000-000000000001', 'heroSubtitle', '"Disconnect from the ordinary. Reconnect with nature."'),
  ('b0000000-0000-0000-0000-000000000001', 'heroDescription', '"Experience the perfect blend of rustic charm and modern comfort at Mountain View Cabin."'),
  ('b0000000-0000-0000-0000-000000000001', 'heroCTAText', '"Check Availability"'),
  ('b0000000-0000-0000-0000-000000000001', 'social_instagram', '"https://instagram.com/mountainviewcabin"'),
  ('b0000000-0000-0000-0000-000000000001', 'social_facebook', '"https://facebook.com/mountainviewcabin"')
ON CONFLICT (organization_id, key) DO UPDATE SET value = EXCLUDED.value;
