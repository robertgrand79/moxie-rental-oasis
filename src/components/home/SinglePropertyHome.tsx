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
import IntegratedBookingSection from '@/components/property/IntegratedBookingSection';
import TestimonialsSection from './TestimonialsSection';
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

        {/* Booking Section - Prominent on single property sites */}
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <IntegratedBookingSection property={property} />
            </div>
          </div>
        </section>

        {/* Photo Gallery */}
        {photos.length > 1 && (
          <section className="py-12 bg-muted/30">
            <div className="container mx-auto px-4">
              <PhotoSpotlight 
                images={photos} 
                featuredPhotos={property.featured_photos}
                title={property.title} 
              />
            </div>
          </section>
        )}

        {/* About the Property */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-foreground mb-8">
                About This Property
              </h2>
              <PropertyDescription description={property.description} isMobile={isMobile} />
            </div>
          </div>
        </section>

        {/* Amenities */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
              Amenities & Features
            </h2>
            <AmenitiesSection amenities={property.amenities} />
          </div>
        </section>

        {/* Reviews */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <PropertyReviewsSection propertyId={property.id} />
          </div>
        </section>

        {/* Testimonials */}
        <TestimonialsSection />

        {/* Newsletter */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <div className="bg-card/95 backdrop-blur-xl rounded-3xl shadow-2xl p-16 mx-auto border border-border/20">
              <TravelNewsletterSignup />
            </div>
          </div>
        </section>

        {/* What's Nearby */}
        <EnhancedWhatsNearbySection />

        {/* Local Events */}
        <EnhancedLocalEventsSection />
      </main>
    </BackgroundWrapper>
  );
};

export default SinglePropertyHome;
