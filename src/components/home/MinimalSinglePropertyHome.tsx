import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { Loader2, MapPin, Users, Bed, Bath, Star } from 'lucide-react';
import { Property } from '@/types/property';
import PhotoSpotlight from '@/components/property/PhotoSpotlight';
import PropertyDescription from '@/components/property/PropertyDescription';
import AmenitiesSection from '@/components/property/AmenitiesSection';
import PropertyReviewsSection from '@/components/property/PropertyReviewsSection';
import CompactBookingCard from '@/components/property/CompactBookingCard';
import StickyBookingBar from '@/components/property/StickyBookingBar';
import EnhancedWhatsNearbySection from './EnhancedWhatsNearbySection';
import EnhancedLocalEventsSection from './EnhancedLocalEventsSection';
import TravelNewsletterSignup from '@/components/TravelNewsletterSignup';
import BackgroundWrapper from './BackgroundWrapper';
import SinglePropertyVideoSection from '@/components/single-property/SinglePropertyVideoSection';
import { FeatureErrorBoundary } from '@/components/error-boundaries/FeatureErrorBoundary';

import { useIsMobile } from '@/hooks/use-mobile';
import { useSimplifiedSiteSettings } from '@/hooks/useSimplifiedSiteSettings';
import { useRatingMetrics } from '@/hooks/useRatingMetrics';

const MinimalSinglePropertyHome: React.FC = () => {
  const { tenantId } = useTenant();
  const isMobile = useIsMobile();
  const { settings } = useSimplifiedSiteSettings();
  const { metrics } = useRatingMetrics();

  const { data: property, isLoading, error } = useQuery({
    queryKey: ['single-property', tenantId],
    queryFn: async () => {
      if (!tenantId) return null;
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('organization_id', tenantId)
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as Property | null;
    },
    enabled: !!tenantId,
  });

  // Preload hero image
  const preloadImages: string[] = property && Array.isArray(property.images) ? property.images : [];
  const coverImage = property ? (property.cover_image_url || property.image_url || preloadImages[0] || '/placeholder.svg') : null;

  useEffect(() => {
    if (!coverImage || coverImage === '/placeholder.svg') return;
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = coverImage;
    link.setAttribute('fetchpriority', 'high');
    document.head.appendChild(link);
    return () => { link.parentNode?.removeChild(link); };
  }, [coverImage]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-4">
          <h1 className="text-2xl font-bold text-foreground mb-4">Property Not Found</h1>
          <p className="text-muted-foreground">No property is currently configured for this site.</p>
        </div>
      </div>
    );
  }

  const images: string[] = Array.isArray(property.images) ? property.images : [];
  const featuredFromImages: string[] = Array.isArray(property.featured_photos)
    ? property.featured_photos.filter((url) => images.includes(url))
    : [];
  const heroImage = property.cover_image_url || property.image_url || images[0] || '/placeholder.svg';
  const youtubeVideoUrl = settings?.youtubeVideoUrl || '';

  return (
    <BackgroundWrapper>
      <main>
        {/* 1. Full-bleed Hero with overlay text */}
        <section className="relative h-[70vh] min-h-[500px] max-h-[800px] overflow-hidden">
          <img
            src={heroImage}
            alt={property.title}
            className="absolute inset-0 w-full h-full object-cover"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 lg:p-16">
            <div className="container mx-auto">
              <div className="max-w-3xl">
                {property.location && (
                  <div className="flex items-center gap-2 text-white/80 mb-3">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm font-medium tracking-wide uppercase">{property.location}</span>
                  </div>
                )}
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                  {property.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm md:text-base">
                  {property.max_guests && (
                    <span className="flex items-center gap-1.5">
                      <Users className="h-4 w-4" /> {property.max_guests} Guests
                    </span>
                  )}
                  {property.bedrooms && (
                    <span className="flex items-center gap-1.5">
                      <Bed className="h-4 w-4" /> {property.bedrooms} Bedrooms
                    </span>
                  )}
                  {property.bathrooms && (
                    <span className="flex items-center gap-1.5">
                      <Bath className="h-4 w-4" /> {property.bathrooms} Baths
                    </span>
                  )}
                  {metrics && (
                    <span className="flex items-center gap-1.5">
                      <Star className="h-4 w-4 fill-current text-icon-amber" />
                      {metrics.formattedRating} · {metrics.reviewText}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Booking Bar */}
        <div className="hidden lg:block sticky top-16 z-40 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
          <div className="container mx-auto px-4">
            <CompactBookingCard property={property} />
          </div>
        </div>

        {/* 3. Description — clean editorial layout */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
                About This Property
              </h2>
              <div className="prose prose-lg max-w-none text-muted-foreground">
                <PropertyDescription description={property.description} isMobile={isMobile} />
              </div>
            </div>
          </div>
        </section>

        {/* 4. Amenities — minimal presentation */}
        <section className="py-12 border-t border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <AmenitiesSection amenities={property.amenities} />
            </div>
          </div>
        </section>

        {/* 5. Photo Gallery */}
        {images.length > 1 && (
          <section className="border-t border-border">
            <PhotoSpotlight 
              images={images} 
              featuredPhotos={featuredFromImages}
              title={property.title} 
            />
          </section>
        )}

        {/* 6. YouTube Video (conditional) */}
        {youtubeVideoUrl && (
          <SinglePropertyVideoSection youtubeUrl={youtubeVideoUrl} />
        )}

        {/* 7. Reviews — clean */}
        <section className="py-12 border-t border-border">
          <PropertyReviewsSection propertyId={property.id} />
        </section>

        {/* 8. Local area */}
        <FeatureErrorBoundary featureName="What's Nearby" showRetry={false}>
          <EnhancedWhatsNearbySection />
        </FeatureErrorBoundary>
        <FeatureErrorBoundary featureName="Local Events" showRetry={false}>
          <EnhancedLocalEventsSection />
        </FeatureErrorBoundary>

        {/* 9. Newsletter — minimal style */}
        <section className="py-16 border-t border-border">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <TravelNewsletterSignup />
            </div>
          </div>
        </section>

        {/* Mobile Sticky Booking Bar */}
        <StickyBookingBar property={property} />
      </main>
    </BackgroundWrapper>
  );
};

export default MinimalSinglePropertyHome;
