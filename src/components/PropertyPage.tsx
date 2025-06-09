
import React from 'react';
import { useParams } from 'react-router-dom';
import { useProperties } from '@/hooks/useProperties';
import { parseAddressSlug } from '@/utils/addressSlug';
import BackgroundWrapper from '@/components/home/BackgroundWrapper';
import PropertyHeader from './property/PropertyHeader';
import PropertyDetails from './property/PropertyDetails';
import BookingCard from './property/BookingCard';
import LoadingState from '@/components/ui/loading-state';

const PropertyPage = () => {
  const { propertyId, addressSlug } = useParams<{ propertyId?: string; addressSlug?: string }>();
  const { properties, loading } = useProperties();

  if (loading) {
    return (
      <BackgroundWrapper>
        <div className="container mx-auto px-4 py-16">
          <LoadingState variant="page" message="Loading property details..." />
        </div>
      </BackgroundWrapper>
    );
  }

  // Find property by ID or by address slug
  let property = null;
  
  if (propertyId) {
    // Try to find by property ID first (handles both UUID and legacy routing)
    property = properties.find(p => p.id === propertyId);
    
    // If not found by ID, try to parse as address slug with ID suffix
    if (!property) {
      const { location, propertyId: extractedId } = parseAddressSlug(propertyId);
      if (extractedId) {
        property = properties.find(p => p.id.startsWith(extractedId));
      } else {
        // Try to match by location
        property = properties.find(p => 
          p.location.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim() === 
          location.toLowerCase()
        );
      }
    }
  } else if (addressSlug) {
    // Handle address slug routing
    const { location, propertyId: extractedId } = parseAddressSlug(addressSlug);
    
    if (extractedId) {
      property = properties.find(p => p.id.startsWith(extractedId));
    } else {
      property = properties.find(p => 
        p.location.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim() === 
        location.toLowerCase()
      );
    }
  }

  if (!property) {
    return (
      <BackgroundWrapper>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Property Not Found</h1>
            <p className="text-xl text-gray-600">The property you're looking for doesn't exist or may have been removed.</p>
          </div>
        </div>
      </BackgroundWrapper>
    );
  }

  return (
    <BackgroundWrapper>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          {/* Property Image */}
          <div className="aspect-video lg:aspect-[2/1] relative">
            <img 
              src={property.image_url} 
              alt={property.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-8 lg:p-12">
            <PropertyHeader property={property} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <PropertyDetails property={property} />
              <BookingCard property={property} />
            </div>
          </div>
        </div>
      </div>
    </BackgroundWrapper>
  );
};

export default PropertyPage;
