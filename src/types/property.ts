
export interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  max_guests: number;
  price_per_night?: number;
  cleaning_fee?: number;
  service_fee_percentage?: number;
  extra_guest_fee?: number;
  extra_guest_threshold?: number;
  pet_fee?: number;
  pet_fee_type?: string;
  image_url?: string;
  cover_image_url?: string;
  images?: string[];
  featured_photos?: string[];
  airbnb_listing_url?: string;
  pricelabs_listing_id?: string;
  amenities?: string;
  display_order?: number;
  latitude?: number;
  longitude?: number;
  organization_id?: string;
  calendar_export_token?: string;
  city?: string;
  state?: string;
  country?: string;
  zip_code?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}
