-- First, temporarily allow NULL for created_by on places table for template data
-- Then insert the 6 points of interest

ALTER TABLE places ALTER COLUMN created_by DROP NOT NULL;

INSERT INTO places (
  id, organization_id, name, description, category, 
  latitude, longitude, distance_from_properties, driving_time,
  is_featured, is_active, display_order, status
) VALUES
(
  '00000000-0000-0000-0001-000000000001',
  'b0000000-0000-0000-0000-000000000001',
  'Summit Ridge Trail',
  'A scenic 4-mile loop trail with stunning panoramic views of the valley. Moderate difficulty with well-marked paths, perfect for morning hikes or sunset walks.',
  'outdoor',
  39.4285,
  -106.0612,
  2.5,
  5,
  true,
  true,
  1,
  'active'
),
(
  '00000000-0000-0000-0001-000000000002',
  'b0000000-0000-0000-0000-000000000001',
  'Mountain House Grill',
  'Locally-owned restaurant serving hearty mountain cuisine with farm-to-table ingredients. Known for their elk burgers and craft beer selection.',
  'dining',
  39.4089,
  -106.0321,
  4.0,
  8,
  true,
  true,
  2,
  'active'
),
(
  '00000000-0000-0000-0001-000000000003',
  'b0000000-0000-0000-0000-000000000001',
  'Crystal Lake',
  'A pristine alpine lake perfect for fishing, kayaking, or simply enjoying a peaceful picnic. Boat rentals available during summer months.',
  'outdoor',
  39.4567,
  -106.1234,
  8.0,
  15,
  true,
  true,
  3,
  'active'
),
(
  '00000000-0000-0000-0001-000000000004',
  'b0000000-0000-0000-0000-000000000001',
  'Pine Valley Ski Area',
  'Family-friendly ski resort with 45 trails for all skill levels. Also offers snowshoeing, tubing, and cozy lodge dining in winter.',
  'activities',
  39.3821,
  -106.1876,
  15.0,
  25,
  true,
  true,
  4,
  'active'
),
(
  '00000000-0000-0000-0001-000000000005',
  'b0000000-0000-0000-0000-000000000001',
  'Highland Vineyards',
  'Award-winning mountain winery offering tastings and tours. Their high-altitude wines have unique flavor profiles you won''t find elsewhere.',
  'attractions',
  39.3945,
  -106.1567,
  12.0,
  20,
  true,
  true,
  5,
  'active'
),
(
  '00000000-0000-0000-0001-000000000006',
  'b0000000-0000-0000-0000-000000000001',
  'Historic Downtown Millbrook',
  'Charming main street lined with local boutiques, antique shops, and cafes. Don''t miss the Saturday farmers market and the old-fashioned candy store.',
  'shopping',
  39.4156,
  -106.0234,
  5.0,
  10,
  true,
  true,
  6,
  'active'
);