
import PropertyShowcase from '@/components/PropertyShowcase';
import BackgroundWrapper from '@/components/home/BackgroundWrapper';
import HeroSection from '@/components/home/HeroSection';
import WhyMoxieSection from '@/components/home/WhyMoxieSection';
import AmenitiesSection from '@/components/home/AmenitiesSection';
import EugeneInfoSection from '@/components/home/EugeneInfoSection';
import BookingBenefitsSection from '@/components/home/BookingBenefitsSection';
import FinalFeaturesSection from '@/components/home/FinalFeaturesSection';

const Index = () => {
  return (
    <BackgroundWrapper>
      <HeroSection />
      
      {/* Property Showcase - Floating Card - Moved above Moxie Experience */}
      <div className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-16 mx-auto border border-white/20">
            <PropertyShowcase />
          </div>
        </div>
      </div>
      
      <WhyMoxieSection />
      <AmenitiesSection />
      <EugeneInfoSection />
      <BookingBenefitsSection />
      <FinalFeaturesSection />
    </BackgroundWrapper>
  );
};

export default Index;
