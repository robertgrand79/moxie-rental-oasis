
-- Professional Template Demo Data - Properties
INSERT INTO properties (id, organization_id, title, description, location, city, bedrooms, bathrooms, max_guests, price_per_night, cleaning_fee, image_url, amenities, display_order, latitude, longitude)
VALUES
  ('d1000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 
   'Oceanview Beach House', 
   'Wake up to panoramic ocean views in this stunning 4-bedroom coastal retreat. This modern beach house features floor-to-ceiling windows, a gourmet kitchen, and direct beach access. Perfect for family gatherings or a luxurious getaway with friends. Enjoy breathtaking sunsets from the expansive deck while listening to the waves crash below.',
   '27500 Pacific Coast Highway, Malibu, CA 90265', 'Malibu',
   4, 3, 10, 450.00, 250.00,
   'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1200&q=80',
   ARRAY['Ocean View', 'Beach Access', 'Hot Tub', 'Gourmet Kitchen', 'WiFi', 'Smart TV', 'Washer/Dryer', 'Outdoor Shower', 'BBQ Grill', 'Fire Pit', 'Parking', 'Air Conditioning'],
   1, 34.0259, -118.7798),

  ('d1000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 
   'Downtown Arts District Loft',
   'Experience the pulse of Los Angeles in this stylish industrial loft located in the heart of the Arts District. High ceilings, exposed brick, and designer furnishings create an urban sanctuary. Walk to world-class restaurants, galleries, and entertainment. Perfect for couples or small groups seeking an authentic LA experience.',
   '1850 Industrial Street, Los Angeles, CA 90021', 'Los Angeles',
   2, 2, 4, 275.00, 125.00,
   'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
   ARRAY['City View', 'Rooftop Access', 'Modern Kitchen', 'WiFi', 'Smart TV', 'Washer/Dryer', 'Gym Access', 'Workspace', 'Air Conditioning', 'Elevator', 'Secure Parking'],
   2, 34.0407, -118.2324),

  ('d1000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 
   'Desert Oasis Villa',
   'Escape to mid-century modern paradise in this beautifully restored Palm Springs villa. Featuring iconic architecture, a private pool, and stunning mountain views, this 3-bedroom retreat offers the perfect blend of vintage charm and contemporary luxury. Ideal for relaxation, wellness retreats, or exploring the desert landscape.',
   '2150 North Indian Canyon Drive, Palm Springs, CA 92262', 'Palm Springs',
   3, 2, 6, 350.00, 175.00,
   'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
   ARRAY['Mountain View', 'Private Pool', 'Hot Tub', 'Mid-Century Design', 'WiFi', 'Smart TV', 'Full Kitchen', 'Outdoor Dining', 'Fire Pit', 'BBQ', 'Parking', 'Air Conditioning'],
   3, 33.8303, -116.5453);

-- Testimonials
INSERT INTO testimonials (organization_id, property_id, guest_name, guest_location, rating, review_text, stay_date, is_featured, status)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'Sarah & Michael Thompson', 'Seattle, WA', 5,
   'Absolutely magical! We celebrated our 10th anniversary here and could not have picked a better spot. Waking up to the sound of waves and watching dolphins from the deck was unforgettable. The house is even more stunning in person.',
   '2025-12-15', true, 'published'),
  
  ('c0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'The Rodriguez Family', 'Denver, CO', 5,
   'Our extended family of 8 had the perfect Thanksgiving getaway. The kitchen was a dream for preparing our feast, and the kids loved having direct beach access. Already planning our return trip!',
   '2025-11-28', true, 'published'),
  
  ('c0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'Jennifer Walsh', 'San Francisco, CA', 4,
   'Beautiful property with incredible views. The sunset from the deck is worth every penny. Only wish we could have stayed longer! The hot tub overlooking the ocean was our favorite spot.',
   '2025-10-20', false, 'published'),

  ('c0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000002', 'David Chen', 'Portland, OR', 5,
   'The perfect base for exploring LA! Walked everywhere - Grand Central Market, The Broad, amazing coffee shops. The loft itself is gorgeous with incredible attention to design details. Will definitely be back.',
   '2025-12-01', true, 'published'),
  
  ('c0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000002', 'Emma & James Miller', 'Austin, TX', 5,
   'We came for a long weekend and fell in love with the Arts District. The loft exceeded our expectations - so stylish and comfortable. The rooftop views at sunset were incredible.',
   '2025-11-15', true, 'published'),
  
  ('c0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000002', 'Marcus Johnson', 'Chicago, IL', 4,
   'Great location, beautiful space, and super responsive host. The neighborhood has amazing restaurants within walking distance. Perfect for a business trip with some leisure time.',
   '2025-10-08', false, 'published'),

  ('c0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000003', 'Lisa & Robert Kim', 'San Diego, CA', 5,
   'Pure mid-century heaven! The architecture and design are stunning, and the pool area is paradise. We spent our days floating, our evenings stargazing by the fire pit. Absolute perfection.',
   '2025-12-10', true, 'published'),
  
  ('c0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000003', 'Amanda Foster', 'Phoenix, AZ', 5,
   'Came for a wellness weekend and it was exactly what we needed. The villa is incredibly peaceful, and the mountain views from the pool are breathtaking. Joshua Tree day trip was a highlight!',
   '2025-11-22', true, 'published'),
  
  ('c0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000003', 'Tom & Patricia O''Brien', 'Boston, MA', 4,
   'What a special place! The vintage vibes combined with modern comforts made for a unique stay. The desert sunsets were spectacular. A true escape from the East Coast winter.',
   '2025-10-30', false, 'published');
