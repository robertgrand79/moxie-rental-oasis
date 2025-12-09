
import React from 'react';
import HeroBackground from './HeroBackground';
import HeroContent from './HeroContent';
import ScrollIndicator from './ScrollIndicator';
import { useHeroSettings } from './hooks/useHeroSettings';

const HeroSection = () => {
  const { settings, isLoading } = useHeroSettings();

  // Show minimal loading state while settings load
  if (isLoading) {
    return (
      <section 
        className="relative h-screen flex items-center justify-center overflow-hidden"
        data-hero-section
      >
        <div className="absolute inset-0 bg-gradient-to-br from-hero-gradient-from to-hero-gradient-to"></div>
        <div className="relative z-10 text-center text-hero-text px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="space-y-8 animate-pulse">
            <div className="h-16 bg-hero-text/20 rounded-lg"></div>
            <div className="h-8 bg-hero-text/20 rounded-lg"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      className="relative h-screen flex items-center justify-center overflow-hidden"
      data-hero-section
    >
      <HeroBackground imageUrl={settings.heroBackgroundImage}>
        <HeroContent settings={settings} />
        <ScrollIndicator />
      </HeroBackground>
    </section>
  );
};

export default HeroSection;
