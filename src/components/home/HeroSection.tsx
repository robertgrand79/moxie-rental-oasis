
import React from 'react';
import { useHeroSettings } from './hooks/useHeroSettings';
import HeroBackground from './HeroBackground';
import HeroContent from './HeroContent';
import ScrollIndicator from './ScrollIndicator';

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

  return (
    <HeroBackground imageUrl={settings.heroBackgroundImage}>
      <HeroContent settings={settings} />
      <ScrollIndicator />
    </HeroBackground>
  );
};

export default HeroSection;
