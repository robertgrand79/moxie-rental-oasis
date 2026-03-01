import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { useTenant } from '@/contexts/TenantContext';
import { supabase } from '@/integrations/supabase/client';
import SinglePropertyHome from '@/components/home/SinglePropertyHome';
import MinimalSinglePropertyHome from '@/components/home/MinimalSinglePropertyHome';
import ModernHeroSection from '@/components/home/ModernHeroSection';
import MainSearchBar from '@/components/MainSearchBar';
import CompactPropertyShowcase from '@/components/home/CompactPropertyShowcase';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import WhyChooseUsSection from '@/components/home/WhyChooseUsSection';
import AmenitiesSection from '@/components/home/AmenitiesSection';
import SocialProofSection from '@/components/home/SocialProofSection';
import LocalInfoSection from '@/components/home/LocalInfoSection';
import EnhancedWhatsNearbySection from '@/components/home/EnhancedWhatsNearbySection';
import EnhancedLocalEventsSection from '@/components/home/EnhancedLocalEventsSection';
import BookingBenefitsSection from '@/components/home/BookingBenefitsSection';
import FinalFeaturesSection from '@/components/home/FinalFeaturesSection';
import TravelNewsletterSignup from '@/components/TravelNewsletterSignup';
import BackgroundWrapper from '@/components/home/BackgroundWrapper';
import SinglePropertyVideoSection from '@/components/single-property/SinglePropertyVideoSection';

import { FeatureErrorBoundary } from '@/components/error-boundaries/FeatureErrorBoundary';
import { useSimplifiedSiteSettings } from '@/hooks/useSimplifiedSiteSettings';

const Index = () => {
  const { isSingleProperty, tenantId } = useTenant();
  const { settings } = useSimplifiedSiteSettings();
  const [searchParams] = useSearchParams();

  const youtubeVideoUrl = settings?.youtubeVideoUrl || '';

  // Allow ?template=slug to override the active template (read-only preview)
  const templateOverride = searchParams.get('template');

  // Fetch active template slug
  const { data: dbTemplateSlug } = useQuery({
    queryKey: ['active-template-slug', tenantId],
    queryFn: async () => {
      if (!tenantId) return 'classic';
      const { data } = await supabase
        .from('organizations')
        .select('active_template_slug, template_type')
        .eq('id', tenantId)
        .single();
      return (data as any)?.active_template_slug || ((data as any)?.template_type === 'multi_property' ? 'multi-classic' : 'classic');
    },
    enabled: !!tenantId,
    staleTime: 5 * 60 * 1000,
  });

  const activeTemplateSlug = templateOverride || dbTemplateSlug;

  // Single property sites - route to the correct template
  if (isSingleProperty) {
    if (activeTemplateSlug === 'minimal') {
      return <MinimalSinglePropertyHome />;
    }
    return <SinglePropertyHome />;
  }

  // Multi-property sites get the current layout with search and grid
  return (
    <BackgroundWrapper>
      <main>
        <FeatureErrorBoundary featureName="Hero Section" showRetry={false}>
          <ModernHeroSection />
        </FeatureErrorBoundary>
        
        {/* Search Bar Section - Overlapping Hero */}
        <section className="relative mt-8 z-30">
          <div className="container mx-auto px-4">
            <FeatureErrorBoundary featureName="Search" showRetry={false}>
              <MainSearchBar />
            </FeatureErrorBoundary>
          </div>
        </section>
        
        <FeatureErrorBoundary featureName="Properties">
          <CompactPropertyShowcase />
        </FeatureErrorBoundary>
        
        <FeatureErrorBoundary featureName="Booking Benefits" showRetry={false}>
          <BookingBenefitsSection />
        </FeatureErrorBoundary>
        
        <FeatureErrorBoundary featureName="Testimonials">
          <TestimonialsSection />
        </FeatureErrorBoundary>
        
        <FeatureErrorBoundary featureName="Social Proof" showRetry={false}>
          <SocialProofSection />
        </FeatureErrorBoundary>

        {/* YouTube Video Section (conditional) */}
        {youtubeVideoUrl && (
          <FeatureErrorBoundary featureName="Video Section" showRetry={false}>
            <SinglePropertyVideoSection youtubeUrl={youtubeVideoUrl} />
          </FeatureErrorBoundary>
        )}
        
        <FeatureErrorBoundary featureName="Why Choose Us" showRetry={false}>
          <WhyChooseUsSection />
        </FeatureErrorBoundary>
        
        <FeatureErrorBoundary featureName="Local Events">
          <EnhancedLocalEventsSection />
        </FeatureErrorBoundary>
        
        <FeatureErrorBoundary featureName="Amenities" showRetry={false}>
          <AmenitiesSection />
        </FeatureErrorBoundary>
        
        <FeatureErrorBoundary featureName="Local Information">
          <LocalInfoSection />
        </FeatureErrorBoundary>


        {/* Newsletter Section */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <div className="bg-card/95 backdrop-blur-xl rounded-3xl shadow-2xl p-16 mx-auto border border-border/20">
              <FeatureErrorBoundary featureName="Newsletter Signup">
                <TravelNewsletterSignup />
              </FeatureErrorBoundary>
            </div>
          </div>
        </section>
        
        <FeatureErrorBoundary featureName="What's Nearby">
          <EnhancedWhatsNearbySection />
        </FeatureErrorBoundary>
        
        <FeatureErrorBoundary featureName="Features" showRetry={false}>
          <FinalFeaturesSection />
        </FeatureErrorBoundary>
      </main>
    </BackgroundWrapper>
  );
};

export default Index;
