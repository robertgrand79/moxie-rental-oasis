
import React from 'react';
import HeroSection from '@/components/home/HeroSection';
import CompactPropertyShowcase from '@/components/home/CompactPropertyShowcase';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import WhyMoxieSection from '@/components/home/WhyMoxieSection';
import AmenitiesSection from '@/components/home/AmenitiesSection';
import SocialProofSection from '@/components/home/SocialProofSection';
import EugeneInfoSection from '@/components/home/EugeneInfoSection';
import EnhancedLifestyleGallerySection from '@/components/home/EnhancedLifestyleGallerySection';
import EnhancedWhatsNearbySection from '@/components/home/EnhancedWhatsNearbySection';
import EnhancedEugeneEventsSection from '@/components/home/EnhancedEugeneEventsSection';
import BookingBenefitsSection from '@/components/home/BookingBenefitsSection';
import FinalFeaturesSection from '@/components/home/FinalFeaturesSection';
import BackgroundWrapper from '@/components/home/BackgroundWrapper';
import ChatWidget from '@/components/chat/ChatWidget';

const Index = () => {
  return (
    <BackgroundWrapper>
      <main>
        <HeroSection />
        <CompactPropertyShowcase />
        <TestimonialsSection />
        <SocialProofSection />
        <WhyMoxieSection />
        <AmenitiesSection />
        <EugeneInfoSection />
        <EnhancedLifestyleGallerySection />
        <EnhancedWhatsNearbySection />
        <EnhancedEugeneEventsSection />
        <BookingBenefitsSection />
        <FinalFeaturesSection />
      </main>
      <ChatWidget />
    </BackgroundWrapper>
  );
};

export default Index;
