-- Create demo property for staymoxie-template-single organization
-- Organization ID: b0000000-0000-0000-0000-000000000001

INSERT INTO properties (
  id,
  organization_id,
  title,
  description,
  location,
  city,
  bedrooms,
  bathrooms,
  max_guests,
  price_per_night,
  cleaning_fee,
  latitude,
  longitude,
  cover_image_url,
  images,
  featured_photos,
  amenities,
  display_order
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'b0000000-0000-0000-0000-000000000001',
  'Mountain View Cabin',
  'Escape to our stunning Mountain View Cabin, a beautifully crafted retreat nestled among towering pines with breathtaking panoramic views of the surrounding peaks. This cozy three-bedroom haven features a magnificent stone fireplace, vaulted ceilings with exposed timber beams, and floor-to-ceiling windows that frame the majestic mountain landscape. Wake up to golden sunrises painting the slopes, enjoy your morning coffee on the wraparound deck, and spend evenings stargazing from the private hot tub.

Every detail has been thoughtfully designed for your comfort and relaxation. The fully equipped gourmet kitchen invites you to prepare memorable meals, while the open-concept living space provides the perfect gathering spot for family and friends. Modern amenities blend seamlessly with rustic charm—high-speed WiFi keeps you connected, a smart TV offers entertainment options, and premium bedding ensures restful nights. Whether you''re seeking adventure on nearby hiking trails or simply unwinding in peaceful solitude, Mountain View Cabin offers an unforgettable mountain escape.',
  '1234 Pine Ridge Road, Blue River, CO 80424',
  'Blue River',
  3,
  2,
  8,
  250,
  150,
  39.4221,
  -106.0553,
  'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1200',
  ARRAY[
    'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1200',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200',
    'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1200',
    'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200',
    'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1200'
  ],
  ARRAY[
    'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1200',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200',
    'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1200'
  ],
  'WiFi, Hot Tub, Fireplace, Mountain Views, Fully Equipped Kitchen, Washer/Dryer, Smart TV, Heating, Air Conditioning, Parking, BBQ Grill, Deck/Patio, Coffee Maker, Dishwasher, Board Games',
  1
);