
import BackgroundWrapper from '@/components/home/BackgroundWrapper';
import HeroSection from '@/components/home/HeroSection';
import CompactPropertyShowcase from '@/components/home/CompactPropertyShowcase';
import WhyMoxieSection from '@/components/home/WhyMoxieSection';
import AmenitiesSection from '@/components/home/AmenitiesSection';
import EugeneInfoSection from '@/components/home/EugeneInfoSection';
import BookingBenefitsSection from '@/components/home/BookingBenefitsSection';
import FinalFeaturesSection from '@/components/home/FinalFeaturesSection';
import Footer from '@/components/Footer';
import NavBar from '@/components/NavBar';

const Index = () => {
  return (
    <>
      <NavBar />
      <BackgroundWrapper>
        <HeroSection />
        <CompactPropertyShowcase />
        <WhyMoxieSection />
        <AmenitiesSection />
        <EugeneInfoSection />
        <BookingBenefitsSection />
        <FinalFeaturesSection />
        <Footer />
      </BackgroundWrapper>
    </>
  );
};

export default Index;
