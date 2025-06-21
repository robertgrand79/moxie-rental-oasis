
import React from 'react';
import HeroBackground from './HeroBackground';
import HeroContent from './HeroContent';
import ScrollIndicator from './ScrollIndicator';
import { useHeroSettings } from './hooks/useHeroSettings';

const HeroSection = () => {
  const { settings } = useHeroSettings();

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
