
import React from 'react';
import ModernHeroSection from '@/components/home/ModernHeroSection';
import MainSearchBar from '@/components/MainSearchBar';
import CompactPropertyShowcase from '@/components/home/CompactPropertyShowcase';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import WhyChooseUsSection from '@/components/home/WhyChooseUsSection';
import AmenitiesSection from '@/components/home/AmenitiesSection';
import SocialProofSection from '@/components/home/SocialProofSection';
import LocalInfoSection from '@/components/home/LocalInfoSection';
import EnhancedLifestyleGallerySection from '@/components/home/EnhancedLifestyleGallerySection';
import EnhancedWhatsNearbySection from '@/components/home/EnhancedWhatsNearbySection';
import EnhancedEugeneEventsSection from '@/components/home/EnhancedEugeneEventsSection';
import BookingBenefitsSection from '@/components/home/BookingBenefitsSection';
import FinalFeaturesSection from '@/components/home/FinalFeaturesSection';
import TravelNewsletterSignup from '@/components/TravelNewsletterSignup';
import BackgroundWrapper from '@/components/home/BackgroundWrapper';

const Index = () => {
  return (
    <BackgroundWrapper>
      <main>
        <ModernHeroSection />
        
        {/* Search Bar Section - Overlapping Hero */}
        <section className="relative mt-8 z-30">
          <div className="container mx-auto px-4">
            <MainSearchBar />
          </div>
        </section>
        
        <CompactPropertyShowcase />
        <TestimonialsSection />
        <SocialProofSection />
        <WhyChooseUsSection />
        <AmenitiesSection />
        <LocalInfoSection />
        <EnhancedLifestyleGallerySection />
        
        {/* Newsletter Section - Added before What's Nearby */}
        <section className="py-20 relative">
          <div className="container mx-auto px-4">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-16 mx-auto border border-white/20">
              <TravelNewsletterSignup />
            </div>
          </div>
        </section>
        
        <EnhancedWhatsNearbySection />
        <EnhancedEugeneEventsSection />
        <BookingBenefitsSection />
        <FinalFeaturesSection />
      </main>
    </BackgroundWrapper>
  );
};

export default Index;
