
import { useEffect } from 'react';
import PropertyShowcase from '@/components/PropertyShowcase';
import BackgroundWrapper from '@/components/home/BackgroundWrapper';
import HeroSection from '@/components/home/HeroSection';
import WhyMoxieSection from '@/components/home/WhyMoxieSection';
import AmenitiesSection from '@/components/home/AmenitiesSection';
import EugeneInfoSection from '@/components/home/EugeneInfoSection';
import BookingBenefitsSection from '@/components/home/BookingBenefitsSection';
import FinalFeaturesSection from '@/components/home/FinalFeaturesSection';

const Index = () => {
  useEffect(() => {
    // Load Hospitable search widget script
    const script = document.createElement('script');
    script.src = 'https://hospitable.b-cdn.net/direct-property-search-widget/hospitable-search-widget.prod.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://hospitable.b-cdn.net/direct-property-search-widget/hospitable-search-widget.prod.js"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return (
    <BackgroundWrapper>
      <HeroSection />
      <WhyMoxieSection />
      <AmenitiesSection />
      <EugeneInfoSection />
      <BookingBenefitsSection />
      
      {/* Property Showcase - Floating Card */}
      <div className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-16 mx-auto border border-white/20">
            <PropertyShowcase />
          </div>
        </div>
      </div>
      
      <FinalFeaturesSection />
    </BackgroundWrapper>
  );
};

export default Index;
