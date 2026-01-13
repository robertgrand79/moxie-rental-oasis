/**
 * Property Form Types
 * Types for property creation and editing forms
 */

/**
 * Property form data - maps form field names to values
 * Used by addProperty and editProperty operations
 */
export interface PropertyFormData {
  title: string;
  description: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  pricePerNight: number;
  airbnbListingUrl?: string | null;
  amenities?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  photos?: File[];
  featuredPhotos?: string[];
  
  // Edit-specific fields
  deletedImages?: string[];
  reorderedExistingImages?: string[];
}

/**
 * Clean property data for database insert/update
 * Maps form fields to database column names
 */
export interface PropertyDatabaseData {
  title: string;
  description: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  max_guests: number;
  price_per_night: number;
  airbnb_listing_url: string | null;
  amenities: string | null;
  latitude: number | null;
  longitude: number | null;
  images: string[];
  featured_photos: string[];
  cover_image_url: string | null;
  image_url: string | null;
  display_order?: number;
  created_by?: string;
  organization_id?: string;
}

/**
 * Maps PropertyFormData to PropertyDatabaseData
 */
export function mapFormToDatabase(
  formData: PropertyFormData,
  uploadedImages: string[],
  userId?: string,
  organizationId?: string
): PropertyDatabaseData {
  return {
    title: formData.title,
    description: formData.description,
    location: formData.location,
    bedrooms: formData.bedrooms,
    bathrooms: formData.bathrooms,
    max_guests: formData.maxGuests,
    price_per_night: formData.pricePerNight,
    airbnb_listing_url: formData.airbnbListingUrl || null,
    amenities: formData.amenities || null,
    latitude: formData.latitude || null,
    longitude: formData.longitude || null,
    images: uploadedImages,
    featured_photos: (formData.featuredPhotos || []).filter(
      (url: string) => !url.startsWith('blob:')
    ),
    cover_image_url: uploadedImages[0] || null,
    image_url: uploadedImages[0] || null,
    display_order: 0,
    created_by: userId,
    organization_id: organizationId,
  };
}

/**
 * Maps PropertyFormData to PropertyDatabaseData for updates
 */
export function mapFormToDatabaseUpdate(
  formData: PropertyFormData,
  allImages: string[]
): Omit<PropertyDatabaseData, 'display_order' | 'created_by'> {
  return {
    title: formData.title,
    description: formData.description,
    location: formData.location,
    bedrooms: formData.bedrooms,
    bathrooms: formData.bathrooms,
    max_guests: formData.maxGuests,
    price_per_night: formData.pricePerNight,
    airbnb_listing_url: formData.airbnbListingUrl || null,
    amenities: formData.amenities || null,
    latitude: formData.latitude || null,
    longitude: formData.longitude || null,
    images: allImages,
    featured_photos: (formData.featuredPhotos || []).filter(
      (url: string) => !url.startsWith('blob:')
    ),
    cover_image_url: allImages[0] || null,
    image_url: allImages[0] || null,
  };
}
