
export interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  pricePerNight: number;
  imageUrl?: string;
  images?: string[]; // Array of all uploaded images
  hospitableBookingUrl?: string;
  amenities?: string;
}
