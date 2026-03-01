import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { Loader2 } from 'lucide-react';
import SinglePropertyHero from './SinglePropertyHero';
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
import SocialProofSection from './SocialProofSection';
import BookingBenefitsSection from './BookingBenefitsSection';
import WhyChooseUsSection from './WhyChooseUsSection';
import FinalFeaturesSection from './FinalFeaturesSection';
import { FeatureErrorBoundary } from '@/components/error-boundaries/FeatureErrorBoundary';

import { useIsMobile } from '@/hooks/use-mobile';
import { useSimplifiedSiteSettings } from '@/hooks/useSimplifiedSiteSettings';

// Preload LCP hero image via link tag for better Lighthouse score
const usePreloadHeroImage = (imageUrl: string | null) => {
  useEffect(() => {
    if (!imageUrl || imageUrl === '/placeholder.svg') return;
    
    const existingPreload = document.querySelector(`link[rel="preload"][href="${imageUrl}"]`);
    if (existingPreload) return;
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = imageUrl;
    link.setAttribute('fetchpriority', 'high');
    document.head.appendChild(link);
    
    return () => {
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    };
  }, [imageUrl]);
};

const SinglePropertyHome: React.FC = () => {
  const { tenantId } = useTenant();
  const isMobile = useIsMobile();
  const { settings } = useSimplifiedSiteSettings();

  // Fetch the single property for this organization
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

  // Determine cover image early for preloading
  const preloadImages: string[] = property && Array.isArray(property.images) ? property.images : [];
  const preloadCoverImage = property ? (property.cover_image_url || property.image_url || preloadImages[0] || null) : null;
  
  usePreloadHeroImage(preloadCoverImage);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Loading property...</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-4">
          <h1 className="text-2xl font-bold text-foreground mb-4">Property Not Found</h1>
          <p className="text-muted-foreground">
            No property is currently configured for this site.
          </p>
        </div>
      </div>
    );
  }

  const images: string[] = Array.isArray(property.images) ? property.images : [];
  const featuredFromImages: string[] = Array.isArray(property.featured_photos)
    ? property.featured_photos.filter((url) => images.includes(url))
    : [];

  const photos: string[] = featuredFromImages.length > 0 ? featuredFromImages : images;
  const coverImage = property.cover_image_url || property.image_url || images[0] || '/placeholder.svg';

  // Get media URLs from settings
  const youtubeVideoUrl = settings?.youtubeVideoUrl || '';

  return (
    <BackgroundWrapper>
      <main>
        {/* 1. Hero Section */}
        <SinglePropertyHero property={property} coverImage={coverImage} />

        {/* 2. Sticky Booking Bar - Desktop Only */}
        <div className="hidden lg:block sticky top-16 z-40 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
          <div className="container mx-auto px-4">
            <CompactBookingCard property={property} />
          </div>
        </div>

        {/* 3. Social Proof */}
        <FeatureErrorBoundary featureName="Social Proof" showRetry={false}>
          <SocialProofSection />
        </FeatureErrorBoundary>

        {/* 4. Full Photo Gallery */}
        {images.length > 1 && (
          <section>
            <PhotoSpotlight 
              images={images} 
              featuredPhotos={featuredFromImages}
              title={property.title} 
            />
          </section>
        )}

        {/* 5. YouTube Video Section (conditional) */}
        {youtubeVideoUrl && (
          <SinglePropertyVideoSection youtubeUrl={youtubeVideoUrl} />
        )}

        {/* 6. Property Description + Amenities */}
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-0">
            <section className="py-8 border-b border-border">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                About This Property
              </h2>
              <PropertyDescription description={property.description} isMobile={isMobile} />
            </section>

            <section className="py-8">
              <AmenitiesSection amenities={property.amenities} />
            </section>
          </div>
        </div>

        {/* 7. Booking Benefits */}
        <FeatureErrorBoundary featureName="Booking Benefits" showRetry={false}>
          <BookingBenefitsSection />
        </FeatureErrorBoundary>

        {/* 8. Reviews */}
        <section className="bg-muted/30">
          <PropertyReviewsSection propertyId={property.id} />
        </section>

        {/* 9. Why Choose Us */}
        <FeatureErrorBoundary featureName="Why Choose Us" showRetry={false}>
          <WhyChooseUsSection />
        </FeatureErrorBoundary>

        {/* 10. What's Nearby + Local Events */}
        <EnhancedWhatsNearbySection />
        <EnhancedLocalEventsSection />

        {/* 11. Newsletter */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <div className="bg-card/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 md:p-12 max-w-4xl mx-auto border border-border/50">
              <TravelNewsletterSignup />
            </div>
          </div>
        </section>

        {/* 12. Final Features */}
        <FeatureErrorBoundary featureName="Final Features" showRetry={false}>
          <FinalFeaturesSection />
        </FeatureErrorBoundary>

        {/* 13. Mobile Sticky Booking Bar */}
        <StickyBookingBar property={property} />
      </main>
    </BackgroundWrapper>
  );
};

export default SinglePropertyHome;
