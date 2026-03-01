import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { Property } from '@/types/property';
import { useSimplifiedSiteSettings } from '@/hooks/useSimplifiedSiteSettings';

import LuxHero from './LuxHero';
import LuxStickyBookingBar from './LuxStickyBookingBar';
import LuxStorySection from './LuxStorySection';
import LuxBentoGallery from './LuxBentoGallery';
import LuxAmenitiesGrid from './LuxAmenitiesGrid';
import LuxReviewsSlider from './LuxReviewsSlider';

import SinglePropertyVideoSection from '@/components/single-property/SinglePropertyVideoSection';
import EnhancedWhatsNearbySection from '@/components/home/EnhancedWhatsNearbySection';
import TravelNewsletterSignup from '@/components/TravelNewsletterSignup';
import { FeatureErrorBoundary } from '@/components/error-boundaries/FeatureErrorBoundary';

// Preload hero image
const usePreloadHeroImage = (url: string | null) => {
  useEffect(() => {
    if (!url || url === '/placeholder.svg') return;
    const existing = document.querySelector(`link[rel="preload"][href="${url}"]`);
    if (existing) return;
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    link.setAttribute('fetchpriority', 'high');
    document.head.appendChild(link);
    return () => { link.parentNode?.removeChild(link); };
  }, [url]);
};

const LuxSinglePropertyHome: React.FC = () => {
  const { tenantId } = useTenant();
  const { settings } = useSimplifiedSiteSettings();

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

  const images: string[] = property && Array.isArray(property.images) ? property.images : [];
  const coverImage = property
    ? property.cover_image_url || property.image_url || images[0] || '/placeholder.svg'
    : null;

  usePreloadHeroImage(coverImage);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Skeleton hero */}
        <div className="min-h-screen bg-muted animate-pulse" />
        {/* Skeleton content */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-24 space-y-6">
          <div className="h-4 w-24 bg-muted rounded animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <div className="space-y-4">
              <div className="h-8 w-full bg-muted rounded animate-pulse" />
              <div className="h-8 w-3/4 bg-muted rounded animate-pulse" />
            </div>
            <div className="space-y-3">
              <div className="h-4 w-full bg-muted rounded animate-pulse" />
              <div className="h-4 w-full bg-muted rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-4">
          <h1 className="font-serif text-3xl text-foreground mb-4">Property Not Found</h1>
          <p className="text-muted-foreground">
            No property is currently configured for this site.
          </p>
        </div>
      </div>
    );
  }

  const youtubeVideoUrl = settings?.youtubeVideoUrl || '';

  return (
    <div className="bg-background text-foreground">
      <main>
        {/* 1. Full-screen Hero */}
        <LuxHero property={property} coverImage={coverImage!} />

        {/* 2. Sticky Booking Bar (appears after scrolling past hero) */}
        <LuxStickyBookingBar property={property} />

        {/* 3. Editorial Story / Description */}
        <LuxStorySection description={property.description || ''} />

        {/* 4. Bento Gallery */}
        <LuxBentoGallery images={images} title={property.title} />

        {/* 5. YouTube Video (conditional) */}
        {youtubeVideoUrl && (
          <FeatureErrorBoundary featureName="Video" showRetry={false}>
            <div className="py-24 md:py-32 border-t border-border/30">
              <SinglePropertyVideoSection youtubeUrl={youtubeVideoUrl} />
            </div>
          </FeatureErrorBoundary>
        )}

        {/* 6. Amenities */}
        <LuxAmenitiesGrid amenities={property.amenities} />

        {/* 7. Reviews Slider */}
        <LuxReviewsSlider propertyId={property.id} />

        {/* 8. What's Nearby */}
        <FeatureErrorBoundary featureName="What's Nearby" showRetry={false}>
          <EnhancedWhatsNearbySection />
        </FeatureErrorBoundary>

        {/* 9. Newsletter — minimal Lux style */}
        <section className="py-24 md:py-32 border-t border-border/30">
          <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
            <div className="max-w-xl mx-auto text-center">
              <TravelNewsletterSignup />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LuxSinglePropertyHome;
