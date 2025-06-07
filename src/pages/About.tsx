
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
      <div className="relative">
        <AboutHero />
        
        <div className="py-24 relative">
          <div className="container mx-auto px-4">
            <MissionSection />
          </div>
        </div>
        
        {/* Get To Know Our Family Section */}
        <div className="py-24 relative">
          <div className="container mx-auto px-4">
            <div className="text-center mb-20">
              <h2 className="text-5xl font-bold text-gray-900 mb-6">Get To Know Our Family</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-gradient-from to-gradient-accent-from mx-auto mb-8"></div>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Meet the passionate team behind Moxie Vacation Rentals
              </p>
            </div>
            
            {/* Robert & Shelly Section */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-16 mb-16 border border-white/20 hover:shadow-3xl transition-all duration-300">
              <div className="max-w-6xl mx-auto">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                  <FamilyPhotoSection />
                  <FamilyDescription />
                </div>
              </div>
            </div>
            
            {/* Gabby Section */}
            <GabbyIntroduction />
          </div>
        </div>

        <div className="py-24 relative">
          <div className="container mx-auto px-4">
            <ValuesSection />
          </div>
        </div>

        <div className="py-24 relative">
          <div className="container mx-auto px-4">
            <ExcellenceAuthenticitySection />
          </div>
        </div>

        <div className="py-24 relative">
          <div className="container mx-auto px-4">
            <ClosingStatement />
          </div>
        </div>
      </div>
    </BackgroundWrapper>
  );
};

export default About;
