
import React from 'react';
import HeroSection from '@/components/home/HeroSection';
import CompactPropertyShowcase from '@/components/home/CompactPropertyShowcase';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import WhyMoxieSection from '@/components/home/WhyMoxieSection';
import AmenitiesSection from '@/components/home/AmenitiesSection';
import SocialProofSection from '@/components/home/SocialProofSection';
import EugeneInfoSection from '@/components/home/EugeneInfoSection';
import LifestyleGallerySection from '@/components/home/LifestyleGallerySection';
import WhatsNearbySection from '@/components/home/WhatsNearbySection';
import EugeneEventsSection from '@/components/home/EugeneEventsSection';
import BookingBenefitsSection from '@/components/home/BookingBenefitsSection';
import FinalFeaturesSection from '@/components/home/FinalFeaturesSection';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import BackgroundWrapper from '@/components/home/BackgroundWrapper';

const Index = () => {
  return (
    <BackgroundWrapper>
      <NavBar />
      <main>
        <HeroSection />
        <CompactPropertyShowcase />
        <TestimonialsSection />
        <SocialProofSection />
        <WhyMoxieSection />
        <AmenitiesSection />
        <EugeneInfoSection />
        <LifestyleGallerySection />
        <WhatsNearbySection />
        <EugeneEventsSection />
        <BookingBenefitsSection />
        <FinalFeaturesSection />
      </main>
      <Footer />
    </BackgroundWrapper>
  );
};

export default Index;
