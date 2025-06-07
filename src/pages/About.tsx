
import React from 'react';
import BackgroundWrapper from '@/components/home/BackgroundWrapper';
import AboutHero from '@/components/about/AboutHero';
import FamilyPhotoSection from '@/components/about/FamilyPhotoSection';
import FamilyDescription from '@/components/about/FamilyDescription';
import GabbyIntroduction from '@/components/about/GabbyIntroduction';
import MissionSection from '@/components/about/MissionSection';
import ValuesSection from '@/components/about/ValuesSection';
import ExcellenceAuthenticitySection from '@/components/about/ExcellenceAuthenticitySection';
import ClosingStatement from '@/components/about/ClosingStatement';

const About = () => {
  return (
    <BackgroundWrapper>
      <div className="container mx-auto px-4 py-16">
        <AboutHero />
        
        <MissionSection />
        
        {/* Get To Know Our Family Section */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">Get To Know Our Family</h2>
          
          {/* Robert & Shelly Section */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-12 mb-12 border border-white/20 hover:shadow-3xl transition-all duration-300">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <FamilyPhotoSection />
                <FamilyDescription />
              </div>
            </div>
          </div>
          
          {/* Gabby Section */}
          <GabbyIntroduction />
        </div>

        <ValuesSection />
        <ExcellenceAuthenticitySection />
        <ClosingStatement />
      </div>
    </BackgroundWrapper>
  );
};

export default About;
