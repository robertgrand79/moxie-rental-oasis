
import React from 'react';
import HeroBackground from './HeroBackground';
import HeroContent from './HeroContent';
import ScrollIndicator from './ScrollIndicator';

const HeroSection = () => {
  return (
    <section 
      className="relative h-screen flex items-center justify-center overflow-hidden"
      data-hero-section
    >
      <HeroBackground />
      <HeroContent />
      <ScrollIndicator />
    </section>
  );
};

export default HeroSection;
