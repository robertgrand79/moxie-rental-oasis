import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTenantProperties } from '@/hooks/useTenantProperties';
import LoadingState from '@/components/ui/loading-state';
import PropertyPageHero from '@/components/property/PropertyPageHero';
import MobilePropertyHero from '@/components/property/MobilePropertyHero';
import AboutPropertySection from '@/components/property/AboutPropertySection';
import AmenitiesSection from '@/components/property/AmenitiesSection';
import PhotoSpotlight from '@/components/property/PhotoSpotlight';
import MobileBookingBar from '@/components/property/MobileBookingBar';
import QuickInfoSection from '@/components/property/QuickInfoSection';
import BackgroundWrapper from '@/components/home/BackgroundWrapper';
import PropertyReviewsSection from '@/components/property/PropertyReviewsSection';
import { generateAddressSlug } from '@/utils/addressSlug';
import { useIsMobile } from '@/hooks/use-mobile';

const PropertyPage = () => {
  const { addressSlug } = useParams<{ addressSlug: string }>();
  const { properties, loading } = useTenantProperties();
  const isMobile = useIsMobile();
  
  // Check URL for tab and date parameters
  const searchParams = new URLSearchParams(window.location.search);
  const tabParam = searchParams.get('tab');
  const checkinParam = searchParams.get('checkin');
  const checkoutParam = searchParams.get('checkout');
  const [activeTab, setActiveTab] = useState(tabParam === 'booking' ? 'booking' : 'about');

  console.log('PropertyPage - Current addressSlug from URL:', addressSlug);
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
    console.log(`Comparing: "${addressSlug}" with "${propertySlug}" for property: ${p.location}`);
    
    return addressSlug === propertySlug;
  });

  console.log('PropertyPage - Found property:', property ? property.title : 'Not found');

  if (!property) {
    return (
      <BackgroundWrapper>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Property Not Found</h1>
            <p className="text-xl text-gray-600">The property you're looking for doesn't exist or has been removed.</p>
            <p className="text-sm text-gray-500 mt-4">Looking for slug: {addressSlug}</p>
          </div>
        </div>
      </BackgroundWrapper>
    );
  }

  // Determine cover image - prioritize cover_image_url, then first image, then featured photos, then image_url
  const coverImage = property.cover_image_url || property.images?.[0] || property.featured_photos?.[0] || property.image_url;

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

  const handleBookingClick = () => {
    // Switch to booking tab
    setActiveTab("booking");
    
    // Smooth scroll to the about property section
    const aboutSection = document.getElementById('about-property');
    if (aboutSection) {
      aboutSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
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

      {/* Photo Spotlight - Property Highlights - Now above About */}
      {property.images && property.images.length > 0 && (
        <PhotoSpotlight
          images={property.images}
          featuredPhotos={property.featured_photos}
          title={property.title}
        />
      )}

      {/* About This Property Section with Booking Tab */}
      <AboutPropertySection 
        property={property} 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        initialCheckin={checkinParam}
        initialCheckout={checkoutParam}
      />

      {/* Amenities Section - Enhanced with new colors and 12-item layout */}
      <AmenitiesSection amenities={property.amenities} />

      {/* Guest Reviews Section */}
      <PropertyReviewsSection propertyId={property.id} />

      {/* Mobile Booking Bar - Updated to use new booking flow */}
      {isMobile && <MobileBookingBar property={property} onBookingClick={handleBookingClick} />}

      {/* Mobile bottom padding to account for fixed booking bar */}
      {isMobile && <div className="h-20" />}
    </div>
  );
};

export default PropertyPage;
