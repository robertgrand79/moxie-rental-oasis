
import React from 'react';
import { useParams } from 'react-router-dom';
import { useProperties } from '@/hooks/useProperties';
import LoadingState from '@/components/ui/loading-state';
import PropertyPageHero from '@/components/property/PropertyPageHero';
import MobilePropertyHero from '@/components/property/MobilePropertyHero';
import AboutPropertySection from '@/components/property/AboutPropertySection';
import AmenitiesSection from '@/components/property/AmenitiesSection';
import PhotoSpotlight from '@/components/property/PhotoSpotlight';
import BookingCard from '@/components/property/BookingCard';
import FloatingBookingCard from '@/components/property/FloatingBookingCard';
import MobileBookingBar from '@/components/property/MobileBookingBar';
import QuickInfoSection from '@/components/property/QuickInfoSection';
import BackgroundWrapper from '@/components/home/BackgroundWrapper';
import { generateAddressSlug } from '@/utils/addressSlug';
import { useIsMobile } from '@/hooks/use-mobile';

const PropertyPage = () => {
  const { slug, addressSlug } = useParams<{ slug?: string; addressSlug?: string }>();
  const { properties, loading } = useProperties();
  const isMobile = useIsMobile();

  // Use addressSlug if available (from /property/:addressSlug route), otherwise use slug
  const currentSlug = addressSlug || slug;

  console.log('PropertyPage - Current slug from URL:', currentSlug);
  console.log('PropertyPage - Available properties:', properties.length);

  if (loading) {
    return (
      <BackgroundWrapper>
        <div className="container mx-auto px-4 py-16">
          <LoadingState variant="page" message="Loading property details..." />
        </div>
      </BackgroundWrapper>
    );
  }

  // Find property by generating consistent slug from location
  const property = properties.find(p => {
    if (!p.location) return false;
    
    const propertySlug = generateAddressSlug(p.location);
    console.log(`Comparing: "${currentSlug}" with "${propertySlug}" for property: ${p.location}`);
    
    return currentSlug === propertySlug;
  });

  console.log('PropertyPage - Found property:', property ? property.title : 'Not found');

  if (!property) {
    return (
      <BackgroundWrapper>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Property Not Found</h1>
            <p className="text-xl text-gray-600">The property you're looking for doesn't exist or has been removed.</p>
            <p className="text-sm text-gray-500 mt-4">Looking for slug: {currentSlug}</p>
          </div>
        </div>
      </BackgroundWrapper>
    );
  }

  // Determine cover image - use first featured photo, first image, or image_url
  const coverImage = property.featured_photos?.[0] || property.images?.[0] || property.image_url;

  const handleBackClick = () => {
    window.history.back();
  };

  const handleShareClick = () => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: property.description,
        url: window.location.href,
      });
    } else {
      // Fallback to copying URL to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Mobile vs Desktop */}
      {coverImage && (
        <>
          {isMobile ? (
            <MobilePropertyHero 
              property={property} 
              coverImage={coverImage}
              onBackClick={handleBackClick}
              onShareClick={handleShareClick}
            />
          ) : (
            <PropertyPageHero 
              property={property} 
              coverImage={coverImage} 
            />
          )}
        </>
      )}

      {/* Quick Info Section - Mobile Only */}
      {isMobile && <QuickInfoSection property={property} />}

      {/* About This Property Section */}
      <AboutPropertySection property={property} />

      {/* Photo Spotlight - Property Highlights - Now above Amenities */}
      {property.images && property.images.length > 0 && (
        <PhotoSpotlight
          images={property.images}
          featuredPhotos={property.featured_photos}
          title={property.title}
        />
      )}

      {/* Amenities Section - Enhanced with new colors */}
      <AmenitiesSection amenities={property.amenities} />

      {/* Booking Section - Desktop */}
      {!isMobile && (
        <div className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <BookingCard property={property} />
            </div>
          </div>
        </div>
      )}

      {/* Floating Booking Card - Desktop */}
      {!isMobile && <FloatingBookingCard property={property} />}

      {/* Mobile Booking Bar */}
      {isMobile && <MobileBookingBar property={property} />}

      {/* Mobile bottom padding to account for fixed booking bar */}
      {isMobile && <div className="h-20" />}
    </div>
  );
};

export default PropertyPage;
