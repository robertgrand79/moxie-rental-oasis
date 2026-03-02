import React, { useState } from 'react';
import PropertyPageHero from '@/components/property/PropertyPageHero';
import MobilePropertyHero from '@/components/property/MobilePropertyHero';
import AboutPropertySection from '@/components/property/AboutPropertySection';
import AmenitiesSection from '@/components/property/AmenitiesSection';
import PhotoSpotlight from '@/components/property/PhotoSpotlight';
import MobileBookingBar from '@/components/property/MobileBookingBar';
import QuickInfoSection from '@/components/property/QuickInfoSection';
import PropertyReviewsSection from '@/components/property/PropertyReviewsSection';
import PropertyLocationMap from '@/components/property/PropertyLocationMap';
import { useIsMobile } from '@/hooks/use-mobile';

interface InlinePropertyDetailProps {
  property: any;
}

const InlinePropertyDetail: React.FC<InlinePropertyDetailProps> = ({ property }) => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('about');

  const coverImage = property.cover_image_url || property.images?.[0] || property.featured_photos?.[0] || property.image_url;

  const handleBookingClick = () => {
    setActiveTab('booking');
    const aboutSection = document.getElementById('about-property');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div>
      {/* Hero Section */}
      {coverImage && (
        <>
          {isMobile ? (
            <MobilePropertyHero
              property={property}
              coverImage={coverImage}
              onBackClick={() => {}}
              onShareClick={() => {
                if (navigator.share) {
                  navigator.share({ title: property.title, text: property.description, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                }
              }}
            />
          ) : (
            <PropertyPageHero property={property} coverImage={coverImage} />
          )}
        </>
      )}

      {/* Quick Info - Mobile Only */}
      {isMobile && <QuickInfoSection property={property} />}

      {/* Photo Spotlight */}
      {property.images && property.images.length > 0 && (
        <PhotoSpotlight
          images={property.images}
          featuredPhotos={property.featured_photos}
          title={property.title}
        />
      )}

      {/* About / Booking Section */}
      <AboutPropertySection
        property={property}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Amenities */}
      <AmenitiesSection amenities={property.amenities} />

      {/* Location Map */}
      <section className="py-12 px-4 md:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground mb-6">Location</h2>
          <PropertyLocationMap property={property} />
          <p className="text-sm text-muted-foreground mt-4">{property.location}</p>
        </div>
      </section>

      {/* Reviews */}
      <PropertyReviewsSection propertyId={property.id} />

      {/* Mobile Booking Bar */}
      {isMobile && <MobileBookingBar property={property} onBookingClick={handleBookingClick} />}
      {isMobile && <div className="h-20" />}
    </div>
  );
};

export default InlinePropertyDetail;
