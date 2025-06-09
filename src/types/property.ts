
export interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  max_guests: number;
  price_per_night: number;
  image_url?: string;
  images?: string[];
  featured_photos?: string[]; // Array of up to 10 selected photos for display
  hospitable_booking_url?: string;
  amenities?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}
