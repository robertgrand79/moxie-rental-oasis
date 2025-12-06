
export interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  max_guests: number;
  price_per_night?: number; // Made optional since we're removing pricing displays
  cleaning_fee?: number;
  service_fee_percentage?: number;
  image_url?: string;
  cover_image_url?: string; // New field for selected cover photo
  images?: string[];
  featured_photos?: string[]; // Array of up to 10 selected photos for display
  airbnb_listing_url?: string; // For Airbnb integration
  pricelabs_listing_id?: string; // PriceLabs integration
  amenities?: string;
  display_order?: number; // New field for custom ordering
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}
