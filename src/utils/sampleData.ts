
import { Property } from '@/types/property';
import { BlogPost } from '@/types/blogPost';

export const sampleProperties: Omit<Property, 'id' | 'created_by'>[] = [
  {
    title: "Cozy Downtown Eugene Cottage",
    description: "A charming 2-bedroom cottage in the heart of downtown Eugene, walking distance to the University of Oregon campus and local restaurants. Perfect for couples or small families exploring the Pacific Northwest.",
    location: "Downtown Eugene, OR",
    bedrooms: 2,
    bathrooms: 1,
    max_guests: 4,
    price_per_night: 145,
    image_url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1556020685-ae41abfc9365?auto=format&fit=crop&w=800&q=80"
    ],
    amenities: "Free WiFi, Full Kitchen, Washer/Dryer, Parking, Pet-Friendly, Air Conditioning, Heating, Coffee Maker, Smart TV",
    hospitable_booking_url: "https://hospitable.com/booking/sample-cottage"
  },
  {
    title: "Modern Riverfront Apartment",
    description: "Stunning 1-bedroom apartment with panoramic views of the Willamette River. Features floor-to-ceiling windows, modern amenities, and easy access to bike trails and parks.",
    location: "Riverfront District, Eugene, OR",
    bedrooms: 1,
    bathrooms: 1,
    max_guests: 2,
    price_per_night: 185,
    image_url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80"
    ],
    amenities: "River Views, Balcony, High-Speed WiFi, Full Kitchen, Dishwasher, Washer/Dryer, Gym Access, Secure Parking, Smart Home Features",
    hospitable_booking_url: "https://hospitable.com/booking/sample-riverfront"
  },
  {
    title: "Family-Friendly Suburban Home",
    description: "Spacious 3-bedroom house in a quiet neighborhood, perfect for families visiting Eugene. Large backyard, fully equipped kitchen, and close to shopping and restaurants.",
    location: "West Eugene, OR",
    bedrooms: 3,
    bathrooms: 2,
    max_guests: 8,
    price_per_night: 225,
    image_url: "https://images.unsplash.com/photo-1571939228382-b2f2b585ce15?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1571939228382-b2f2b585ce15?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=800&q=80"
    ],
    amenities: "Large Backyard, BBQ Grill, Full Kitchen, 2-Car Garage, Washer/Dryer, Kids Play Area, WiFi, Cable TV, Central AC/Heat",
    hospitable_booking_url: "https://hospitable.com/booking/sample-family-home"
  },
  {
    title: "Luxury University District Loft",
    description: "Elegant loft-style apartment near the University of Oregon. High ceilings, exposed brick, and premium finishes make this perfect for business travelers or couples seeking luxury.",
    location: "University District, Eugene, OR",
    bedrooms: 1,
    bathrooms: 1,
    max_guests: 2,
    price_per_night: 195,
    image_url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&w=800&q=80"
    ],
    amenities: "Exposed Brick, High Ceilings, Premium Appliances, Wine Fridge, Smart TV, High-Speed WiFi, Luxury Linens, Parking",
    hospitable_booking_url: "https://hospitable.com/booking/sample-luxury-loft"
  }
];

export const sampleBlogPosts: Omit<BlogPost, 'id' | 'created_at' | 'updated_at' | 'created_by'>[] = [
  {
    title: "Ultimate Guide to Eugene's Food Scene",
    slug: "ultimate-guide-eugene-food-scene",
    content: `# Ultimate Guide to Eugene's Food Scene

Eugene, Oregon is a foodie paradise with an incredible diversity of culinary experiences. From farm-to-table restaurants to food trucks serving international cuisine, this vibrant city has something for every palate.

## Farm-to-Table Excellence

Eugene's commitment to local, sustainable agriculture shines through in its restaurant scene. Many establishments source directly from local farms, ensuring fresh, seasonal ingredients year-round.

### Must-Visit Restaurants

**The Vintage** - Located in the 5th Street Public Market, this upscale restaurant offers contemporary Pacific Northwest cuisine with an extensive wine list.

**Marché** - A French-inspired restaurant known for its seasonal menu and exceptional service.

**Belly Taco** - Authentic Mexican cuisine with locally-sourced ingredients and creative taco combinations.

## Food Trucks and Casual Dining

Eugene's food truck scene is legendary, with pods scattered throughout the city offering everything from Korean BBQ to artisanal ice cream.

## Local Markets

Don't miss the Saturday Market, where you can sample local produce, artisanal foods, and handcrafted goods while enjoying live music and street performances.

Whether you're staying in one of our vacation rentals or just visiting, Eugene's food scene will leave you planning your next culinary adventure before you've even left.`,
    excerpt: "Discover Eugene's incredible food scene, from farm-to-table restaurants to legendary food trucks. Your ultimate guide to dining in the Pacific Northwest.",
    author: "Moxie Team",
    status: "published" as const,
    published_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    image_url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80",
    tags: ["food", "dining", "local", "restaurants"],
    // Add new required unified content fields
    content_type: 'article',
    metadata: {},
    display_order: 0,
    is_featured: false,
    is_active: true
  },
  {
    title: "Exploring Eugene's Outdoor Adventures",
    slug: "exploring-eugene-outdoor-adventures",
    content: `# Exploring Eugene's Outdoor Adventures

Eugene is an outdoor enthusiast's dream destination, nestled between the Cascade Mountains and the Pacific Coast. Whether you're into hiking, biking, or water sports, this city offers endless opportunities for adventure.

## Hiking Trails for Every Level

### Spencer Butte
A moderate 1.7-mile hike that rewards you with panoramic views of Eugene and the surrounding valley. Perfect for sunset viewing!

### Mount Pisgah
Located just southeast of Eugene, this trail network offers various difficulty levels and stunning views of the Willamette Valley.

### Pre's Trail
Named after legendary runner Steve Prefontaine, this wood-chip trail along the Willamette River is perfect for running or walking.

## Cycling Paradise

Eugene is incredibly bike-friendly with an extensive network of bike paths and lanes. The Ruth Bascom Riverbank Trail System provides miles of scenic cycling along the river.

## Water Activities

The Willamette River offers opportunities for kayaking, stand-up paddleboarding, and fishing. Several local outfitters provide rentals and guided tours.

## Winter Sports

When snow falls in the nearby Cascades, world-class skiing and snowboarding are just a short drive away at Willamette Pass and Hoodoo Ski Area.

Plan your outdoor adventure from the comfort of our vacation rentals, perfectly positioned to access all of Eugene's natural wonders.`,
    excerpt: "From hiking Spencer Butte to cycling the riverbank trails, discover why Eugene is the perfect base for your Pacific Northwest outdoor adventure.",
    author: "Moxie Team",
    status: "published" as const,
    published_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    image_url: "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=800&q=80",
    tags: ["outdoor", "hiking", "cycling", "adventure"],
    // Add new required unified content fields
    content_type: 'article',
    metadata: {},
    display_order: 0,
    is_featured: false,
    is_active: true
  },
  {
    title: "University of Oregon: A Campus Worth Exploring",
    slug: "university-oregon-campus-worth-exploring",
    content: `# University of Oregon: A Campus Worth Exploring

The University of Oregon campus is not just for students and academics – it's a beautiful destination that offers attractions for visitors of all ages. Whether you're in town for a Duck game or just exploring Eugene, the UO campus is worth a visit.

## Architectural Highlights

The campus features a beautiful mix of historic and modern architecture. Don't miss:

- **Deady Hall** - The oldest building on campus, built in 1876
- **Knight Library** - A stunning example of modern university architecture
- **Hayward Field** - The legendary track and field venue, recently renovated

## Museums and Galleries

### Jordan Schnitzer Museum of Art
Home to an impressive collection of Pacific Northwest art, Asian art, and contemporary works. The museum regularly hosts special exhibitions and events.

### Museum of Natural and Cultural History
Explore Oregon's natural history, including fossils, minerals, and cultural artifacts from the region's indigenous peoples.

## Game Day Experience

If you're visiting during football season, experiencing a Duck game at Autzen Stadium is unforgettable. The energy is electric, and Eugene truly comes alive on game days.

## Campus Events

The university hosts numerous public events throughout the year, including concerts, lectures, and festivals. Check their calendar when planning your visit.

Stay at one of our nearby vacation rentals and walk or bike to campus – you'll be perfectly positioned to explore everything the University of Oregon has to offer.`,
    excerpt: "Discover the beauty and attractions of the University of Oregon campus, from world-class museums to legendary sports venues.",
    author: "Moxie Team",
    status: "published" as const,
    published_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    image_url: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80",
    tags: ["university", "campus", "culture", "attractions"],
    // Add new required unified content fields
    content_type: 'article',
    metadata: {},
    display_order: 0,
    is_featured: false,
    is_active: true
  }
];
