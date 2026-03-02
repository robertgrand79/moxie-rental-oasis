import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { useTenant } from '@/contexts/TenantContext';
import { supabase } from '@/integrations/supabase/client';
import SinglePropertyHome from '@/components/home/SinglePropertyHome';
import MinimalSinglePropertyHome from '@/components/home/MinimalSinglePropertyHome';
import LuxSinglePropertyHome from '@/components/templates/lux-single/LuxSinglePropertyHome';
import LuxPortfolioHome from '@/components/templates/lux-portfolio/LuxPortfolioHome';
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
  const { data: dbTemplateSlug, isLoading: isTemplateLoading } = useQuery({
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

  // Wait for template slug to resolve before rendering to prevent flash of wrong template
  if (!templateOverride && isTemplateLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Route based on the resolved template slug directly
  // This ensures the template selection always takes priority over template_type
  const singleTemplateSlugs = ['classic', 'minimal', 'lux-single'];
  const multiTemplateSlugs = ['multi-classic', 'lux-portfolio'];

  // Single property templates
  if (activeTemplateSlug === 'lux-single') {
    return <LuxSinglePropertyHome />;
  }
  if (activeTemplateSlug === 'minimal') {
    return <MinimalSinglePropertyHome />;
  }
  if (activeTemplateSlug === 'classic') {
    return <SinglePropertyHome />;
  }

  // Multi-property templates
  if (activeTemplateSlug === 'lux-portfolio') {
    return <LuxPortfolioHome />;
  }

  // Fallback: use isSingleProperty from org type if slug doesn't match known templates
  if (isSingleProperty) {
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
