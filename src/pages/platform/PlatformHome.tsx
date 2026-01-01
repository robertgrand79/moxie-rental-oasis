import React from 'react';
import HeroSection from '@/components/platform/homepage/HeroSection';
// import SocialProofBar from '@/components/platform/homepage/SocialProofBar'; // Hidden until we have real conversions
import ProblemSection from '@/components/platform/homepage/ProblemSection';
import PillarsSection from '@/components/platform/homepage/PillarsSection';
import MoxieAISection from '@/components/platform/homepage/MoxieAISection';
import LocalBrandSection from '@/components/platform/homepage/LocalBrandSection';
import TVAppSection from '@/components/platform/homepage/TVAppSection';
import CalculatorSection from '@/components/platform/homepage/CalculatorSection';
import PricingSection from '@/components/platform/homepage/PricingSection';
import FAQSection from '@/components/platform/homepage/FAQSection';
import CTASection from '@/components/platform/homepage/CTASection';

const PlatformHome: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      {/* <SocialProofBar /> - Hidden until we have real conversions */}
      <ProblemSection />
      <PillarsSection />
      <MoxieAISection />
      <LocalBrandSection />
      <TVAppSection />
      <CalculatorSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
    </div>
  );
};

export default PlatformHome;
