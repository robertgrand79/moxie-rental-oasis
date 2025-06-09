
import React from 'react';
import { useParams } from 'react-router-dom';
import { useProperties } from '@/hooks/useProperties';
import { parseAddressSlug } from '@/utils/addressSlug';
import PropertyPageHero from './property/PropertyPageHero';
import PropertyInfoSection from './property/PropertyInfoSection';
import MasonryPhotoGallery from './property/MasonryPhotoGallery';
import EnhancedPropertyDetails from './property/EnhancedPropertyDetails';
import FloatingBookingCard from './property/FloatingBookingCard';
import LoadingState from '@/components/ui/loading-state';

const PropertyPage = () => {
  const { propertyId, addressSlug } = useParams<{ propertyId?: string; addressSlug?: string }>();
  const { properties, loading } = useProperties();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <LoadingState variant="page" message="Loading property details..." />
      </div>
    );
  }

  // Find property by ID or by address slug
  let property = null;
  
  if (propertyId) {
    // Parse the propertyId parameter which could be either an ID or address slug
    const { location, propertyId: extractedId } = parseAddressSlug(propertyId);
    
    if (extractedId) {
      // Has property ID suffix - use ID for lookup (backward compatibility)
      property = properties.find(p => p.id.startsWith(extractedId));
    } else {
      // Clean address slug - find by location first
      const normalizedLocation = location.toLowerCase().trim();
      property = properties.find(p => 
        p.location.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim() === 
        normalizedLocation
      );
      
      // Fallback: try to find by exact ID match if location lookup fails
      if (!property) {
        property = properties.find(p => p.id === propertyId);
      }
    }
  } else if (addressSlug) {
    // Handle address slug routing
    const { location, propertyId: extractedId } = parseAddressSlug(addressSlug);
    
    if (extractedId) {
      // Has property ID suffix - use ID for lookup (backward compatibility)
      property = properties.find(p => p.id.startsWith(extractedId));
    } else {
      // Clean address slug - find by location
      const normalizedLocation = location.toLowerCase().trim();
      property = properties.find(p => 
        p.location.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim() === 
        normalizedLocation
      );
    }
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">Property Not Found</h1>
          <p className="text-xl text-muted-foreground">The property you're looking for doesn't exist or may have been removed.</p>
        </div>
      </div>
    );
  }

  // Prepare images array - use images array if available, fallback to single image_url
  const propertyImages = property.images && property.images.length > 0 
    ? property.images 
    : property.image_url 
      ? [property.image_url] 
      : [];

  const coverImage = propertyImages[0] || '/placeholder.svg';

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <PropertyPageHero property={property} coverImage={coverImage} />

      {/* Floating Booking Card */}
      <FloatingBookingCard property={property} />

      {/* Property Information Section */}
      <PropertyInfoSection property={property} />

      {/* Photo Gallery */}
      <MasonryPhotoGallery 
        images={propertyImages} 
        featuredPhotos={property.featured_photos}
        title={property.title} 
      />

      {/* Enhanced Property Details */}
      <EnhancedPropertyDetails property={property} />

      {/* Mobile Booking Card */}
      <div className="lg:hidden sticky bottom-0 z-40 bg-background border-t border-border p-4">
        <FloatingBookingCard property={property} />
      </div>
    </div>
  );
};

export default PropertyPage;
