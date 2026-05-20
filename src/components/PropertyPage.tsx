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
import PropertyLocationMap from '@/components/property/PropertyLocationMap';
import { generateAddressSlug } from '@/utils/addressSlug';
import { useIsMobile } from '@/hooks/use-mobile';
import type { Property } from '@/types/property';

type PropertyPageErrorBoundaryState = {
  hasError: boolean;
};

class PropertyPageErrorBoundary extends React.Component<
  { children: React.ReactNode },
  PropertyPageErrorBoundaryState
> {
  state: PropertyPageErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): PropertyPageErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('PropertyPage render failed', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <BackgroundWrapper>
          <div className="container mx-auto px-4 py-16">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Property Unavailable</h1>
              <p className="text-xl text-gray-600">
                We hit a problem loading this property page. Please try again in a moment.
              </p>
            </div>
          </div>
        </BackgroundWrapper>
      );
    }

    return this.props.children;
  }
}

const sanitizePropertyForRender = (property: Property): Property => {
  const sanitizedImages = Array.isArray(property.images)
    ? property.images.filter((image): image is string => typeof image === 'string' && image.trim().length > 0)
    : [];

  const sanitizedFeaturedPhotos = Array.isArray(property.featured_photos)
    ? property.featured_photos.filter(
        (image): image is string => typeof image === 'string' && image.trim().length > 0
      )
    : [];

  return {
    ...property,
    title: property.title || 'Untitled Property',
    description: property.description || '',
    location: property.location || '',
    amenities: property.amenities || '',
    images: sanitizedImages,
    featured_photos: sanitizedFeaturedPhotos,
    image_url: property.image_url || undefined,
    cover_image_url: property.cover_image_url || undefined,
    organization_id: property.organization_id || undefined,
  };
};

const PropertyPageContent = () => {
  const { addressSlug } = useParams<{ addressSlug: string }>();
  const { properties, loading } = useTenantProperties();
  const isMobile = useIsMobile();

  const searchParams = new URLSearchParams(window.location.search);
  const tabParam = searchParams.get('tab');
  const checkinParam = searchParams.get('checkin');
  const checkoutParam = searchParams.get('checkout');
  const [activeTab, setActiveTab] = useState(tabParam === 'booking' ? 'booking' : 'about');

  if (loading) {
    return (
      <BackgroundWrapper>
        <div className="container mx-auto px-4 py-16">
          <LoadingState variant="page" message="Loading property details..." />
        </div>
      </BackgroundWrapper>
    );
  }

  const property = properties.find((candidate) => {
    if (!candidate.location) return false;
    return addressSlug === generateAddressSlug(candidate.location);
  });

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

  const safeProperty = sanitizePropertyForRender(property);
  const coverImage =
    safeProperty.cover_image_url ||
    safeProperty.images?.[0] ||
    safeProperty.featured_photos?.[0] ||
    safeProperty.image_url;

  const handleBackClick = () => {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  };

  const handleShareClick = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: safeProperty.title,
          text: safeProperty.description,
          url: window.location.href,
        });
        return;
      } catch (error) {
        console.warn('Native share failed, falling back to clipboard', error);
      }
    }

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(window.location.href);
      } catch (error) {
        console.warn('Clipboard copy failed', error);
      }
    }
  };

  const handleBookingClick = () => {
    setActiveTab('booking');

    const aboutSection = document.getElementById('about-property');
    if (aboutSection) {
      aboutSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {coverImage && (
        <>
          {isMobile ? (
            <MobilePropertyHero
              property={safeProperty}
              coverImage={coverImage}
              onBackClick={handleBackClick}
              onShareClick={handleShareClick}
            />
          ) : (
            <PropertyPageHero property={safeProperty} coverImage={coverImage} />
          )}
        </>
      )}

      {isMobile && <QuickInfoSection property={safeProperty} />}

      {safeProperty.images && safeProperty.images.length > 0 && (
        <PhotoSpotlight
          images={safeProperty.images}
          featuredPhotos={safeProperty.featured_photos}
          title={safeProperty.title}
        />
      )}

      <AboutPropertySection
        property={safeProperty}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        initialCheckin={checkinParam}
        initialCheckout={checkoutParam}
      />

      <AmenitiesSection amenities={safeProperty.amenities} />

      <section className="py-12 px-4 md:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Location</h2>
          <PropertyLocationMap property={safeProperty} />
          <p className="text-sm text-muted-foreground mt-4">{safeProperty.location}</p>
        </div>
      </section>

      <PropertyReviewsSection propertyId={safeProperty.id} />

      {isMobile && <MobileBookingBar property={safeProperty} onBookingClick={handleBookingClick} />}
      {isMobile && <div className="h-20" />}
    </div>
  );
};

const PropertyPage = () => {
  return (
    <PropertyPageErrorBoundary>
      <PropertyPageContent />
    </PropertyPageErrorBoundary>
  );
};

export default PropertyPage;
