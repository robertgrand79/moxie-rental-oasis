import React from 'react';
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

  // Parse photos from images array or featured_photos
  const photos: string[] = property.featured_photos || property.images || [];
  const coverImage = property.cover_image_url || photos[0] || '/placeholder.svg';

  return (
    <BackgroundWrapper>
      <main>
        {/* Hero Section */}
        <SinglePropertyHero property={property} coverImage={coverImage} />

        {/* Main Content with Sidebar Layout */}
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 py-12">
            
            {/* Main Content Column */}
            <div className="lg:col-span-2 space-y-0">
              
              {/* Property Description */}
              <section className="py-8 border-b border-border">
                <h2 className="text-2xl font-bold text-foreground mb-6">
                  About This Property
                </h2>
                <PropertyDescription description={property.description} isMobile={isMobile} />
              </section>

              {/* Photo Gallery - Full width within content area */}
              {photos.length > 1 && (
                <section className="py-8 border-b border-border -mx-4 lg:mx-0">
                  <PhotoSpotlight 
                    images={photos} 
                    featuredPhotos={property.featured_photos}
                    title={property.title} 
                  />
                </section>
              )}

              {/* Amenities */}
              <section className="py-8">
                <AmenitiesSection amenities={property.amenities} />
              </section>
            </div>

            {/* Sticky Booking Sidebar - Desktop Only */}
            <div className="hidden lg:block">
              <CompactBookingCard property={property} />
            </div>
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
