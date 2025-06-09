
export interface PropertyFormData {
  title: string;
  description: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  pricePerNight: number;
  hospitableBookingUrl?: string;
  amenities?: string;
  photos?: File[];
  images?: string[]; // Existing uploaded images
  featuredPhotos?: string[]; // Selected featured photos for display
  selectedCoverIndex?: number; // Index of selected cover image
}
