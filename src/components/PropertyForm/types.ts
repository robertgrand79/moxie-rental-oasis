
export interface PropertyFormData {
  title: string;
  description: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  pricePerNight: number;
  airbnbListingUrl?: string;
  amenities?: string;
  displayOrder?: number; // New field for custom ordering
  latitude?: number; // Geocoded latitude coordinate
  longitude?: number; // Geocoded longitude coordinate
  photos?: File[];
  images?: string[]; // Existing uploaded images
  featuredPhotos?: string[]; // Selected featured photos for display (up to 10)
  selectedCoverIndex?: number; // Index of selected cover image
}
