
import React from 'react';
import HeroBackground from './HeroBackground';
import HeroContent from './HeroContent';
import ScrollIndicator from './ScrollIndicator';
import { useHeroSettings } from './hooks/useHeroSettings';

const HeroSection = () => {
  const { settings, isLoading } = useHeroSettings();

  // Show minimal neutral loading state while settings load
  if (isLoading) {
    return (
      <section 
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        data-hero-section
      >
        <div className="absolute inset-0 bg-black/80"></div>
        <div className="relative z-10">
          <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
      </section>
    );
  }

  return (
    <section 
      className="relative min-h-screen flex items-center justify-center overflow-hidden py-20"
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
