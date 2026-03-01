import React, { useMemo } from 'react';
import { useTenantProperties } from '@/hooks/useTenantProperties';
import { useTenantSettings } from '@/hooks/useTenantSettings';
import { useRatingMetrics } from '@/hooks/useRatingMetrics';

import LuxPortfolioHero from './LuxPortfolioHero';
import LuxConciergeSearch from './LuxConciergeSearch';
import LuxDestinations from './LuxDestinations';
import LuxEditorialGrid from './LuxEditorialGrid';

import TestimonialsSection from '@/components/home/TestimonialsSection';
import EnhancedWhatsNearbySection from '@/components/home/EnhancedWhatsNearbySection';
import TravelNewsletterSignup from '@/components/TravelNewsletterSignup';
import { FeatureErrorBoundary } from '@/components/error-boundaries/FeatureErrorBoundary';
import { Star } from 'lucide-react';

const LuxPortfolioHome: React.FC = () => {
  const { properties, loading } = useTenantProperties();
  const { settings } = useTenantSettings();
  const { metrics } = useRatingMetrics();

  // Collect hero images from the first few properties
  const heroImages = useMemo(() => {
    return properties
      .slice(0, 4)
      .map((p) => p.cover_image_url || p.image_url || (p.images && p.images[0]))
      .filter(Boolean) as string[];
  }, [properties]);

  // Build destinations from unique cities
  const destinations = useMemo(() => {
    const cityMap = new Map<string, { image: string; count: number }>();
    properties.forEach((p) => {
      const city = p.city || p.location?.split(',')[0]?.trim();
      if (!city) return;
      const existing = cityMap.get(city);
      if (existing) {
        existing.count += 1;
      } else {
        const img = p.cover_image_url || p.image_url || (p.images && p.images[0]) || '';
        cityMap.set(city, { image: img, count: 1 });
      }
    });
    return Array.from(cityMap.entries()).map(([city, data]) => ({
      city,
      image: data.image,
      count: data.count,
    }));
  }, [properties]);

  const heroHeadline =
    settings.heroTitle || 'A Curated Collection of Exceptional Homes';
  const heroSubheadline =
    settings.heroSubtitle || 'Handpicked residences for the discerning traveler';

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="min-h-screen bg-muted animate-pulse" />
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-32 space-y-8">
          <div className="h-3 w-20 bg-muted rounded animate-pulse" />
          <div className="h-10 w-80 bg-muted rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-16">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-[3/4] bg-muted rounded animate-pulse" />
                <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                <div className="h-6 w-48 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground">
      <main>
        {/* 1. Full-screen Hero with cycling property images */}
        <LuxPortfolioHero
          images={heroImages}
          headline={heroHeadline}
          subheadline={heroSubheadline}
        />

        {/* 2. Concierge Search — floating pill */}
        <LuxConciergeSearch />

        {/* 3. Social proof strip — subtle */}
        {metrics && metrics.totalReviews > 0 && (
          <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-8 flex items-center justify-center gap-8 text-xs tracking-[0.2em] uppercase text-muted-foreground/70">
            <span className="flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 fill-foreground text-foreground" />
              {metrics.formattedRating} Average Rating
            </span>
            <span className="w-px h-4 bg-primary/10" />
            <span>{metrics.reviewText}</span>
            <span className="w-px h-4 bg-primary/10" />
            <span>{properties.length} {properties.length === 1 ? 'Residence' : 'Residences'}</span>
          </div>
        )}

        {/* 4. Destinations */}
        {destinations.length > 1 && (
          <LuxDestinations destinations={destinations} />
        )}

        {/* 5. Editorial property grid */}
        <LuxEditorialGrid properties={properties} />

        {/* 6. Testimonials — reuse existing but within lux styling wrapper */}
        <div className="border-t border-primary/10">
          <FeatureErrorBoundary featureName="Testimonials" showRetry={false}>
            <TestimonialsSection />
          </FeatureErrorBoundary>
        </div>

        {/* 7. What's Nearby */}
        <div className="border-t border-primary/10">
          <FeatureErrorBoundary featureName="What's Nearby" showRetry={false}>
            <EnhancedWhatsNearbySection />
          </FeatureErrorBoundary>
        </div>

        {/* 8. Newsletter */}
        <section className="py-32 border-t border-primary/10">
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

export default LuxPortfolioHome;
