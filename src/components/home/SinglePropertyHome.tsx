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
import { useIsMobile } from '@/hooks/use-mobile';

// Preload LCP hero image via link tag for better Lighthouse score
const usePreloadHeroImage = (imageUrl: string | null) => {
  useEffect(() => {
    if (!imageUrl || imageUrl === '/placeholder.svg') return;
    
    // Check if preload already exists
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
  
  // Preload hero image for better LCP
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

  // Photos shown on the public site must come from what is actually saved on the property.
  // Treat `images` as the source of truth; only allow featured_photos that exist in `images`.
  const images: string[] = Array.isArray(property.images) ? property.images : [];
  const featuredFromImages: string[] = Array.isArray(property.featured_photos)
    ? property.featured_photos.filter((url) => images.includes(url))
    : [];

  const photos: string[] = featuredFromImages.length > 0 ? featuredFromImages : images;
  const coverImage = property.cover_image_url || property.image_url || images[0] || '/placeholder.svg';
  return (
    <BackgroundWrapper>
      <main>
        {/* Hero Section */}
        <SinglePropertyHero property={property} coverImage={coverImage} />

        {/* Full-Width Sticky Booking Bar - Desktop Only */}
        <div className="hidden lg:block sticky top-16 z-40 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
          <div className="container mx-auto px-4">
            <CompactBookingCard property={property} />
          </div>
        </div>

        {/* Photo Gallery - Full Width */}
        {images.length > 1 && (
          <section className="py-12">
            <div className="container mx-auto px-4">
              <PhotoSpotlight 
                images={images} 
                featuredPhotos={featuredFromImages}
                title={property.title} 
              />
            </div>
          </section>
        )}

        {/* Property Info Section */}
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-0">
            
            {/* Property Description */}
            <section className="py-8 border-b border-border">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                About This Property
              </h2>
              <PropertyDescription description={property.description} isMobile={isMobile} />
            </section>

            {/* Amenities */}
            <section className="py-8">
              <AmenitiesSection amenities={property.amenities} />
            </section>
          </div>
        </div>

        {/* Reviews - Full Width */}
        <section className="bg-muted/30">
          <PropertyReviewsSection propertyId={property.id} />
        </section>

        {/* What's Nearby */}
        <EnhancedWhatsNearbySection />

        {/* Local Events */}
        <EnhancedLocalEventsSection />

        {/* Newsletter */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="bg-card rounded-2xl shadow-xl p-8 md:p-12 max-w-4xl mx-auto border border-border/50">
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

export default SinglePropertyHome;
