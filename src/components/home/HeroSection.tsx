
import React from 'react';
import { useHeroSettings } from './hooks/useHeroSettings';
import HeroContent from './HeroContent';
import ScrollIndicator from './ScrollIndicator';
import OptimizedImage from '@/components/ui/optimized-image';

const HeroSection = () => {
  const { settings, isLoading, error } = useHeroSettings();

  if (isLoading) {
    console.log('⏳ Hero section loading...');
    return (
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-600 to-gray-800"></div>
        <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="space-y-8">
            <div className="h-16 bg-white/20 rounded animate-pulse"></div>
            <div className="h-8 bg-white/20 rounded animate-pulse"></div>
          </div>
        </div>
      </section>
    );
  }

  console.log('🎯 Hero Section Render State:', {
    settings,
    error,
    imageUrl: settings.heroBackgroundImage
  });

  const hasHeroImage = settings.heroBackgroundImage && settings.heroBackgroundImage.trim() !== '';

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image or Gradient */}
      {hasHeroImage ? (
        <div className="absolute inset-0">
          <OptimizedImage
            src={settings.heroBackgroundImage}
            alt="Hero background"
            className="w-full h-full object-cover"
            priority={true}
            showProgressiveLoading={true}
            aspectRatio="auto"
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-black/30 to-black/40"></div>
        </div>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-600 to-gray-800"></div>
      )}

      {/* Content */}
      <HeroContent settings={settings} />
      <ScrollIndicator />
    </section>
  );
};

export default HeroSection;
