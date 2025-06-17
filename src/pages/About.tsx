
import React from 'react';
import AboutHero from '@/components/about/AboutHero';
import FamilyPhotoSection from '@/components/about/FamilyPhotoSection';
import FamilyDescription from '@/components/about/FamilyDescription';
import MissionSection from '@/components/about/MissionSection';
import ValuesSection from '@/components/about/ValuesSection';
import ExcellenceAuthenticitySection from '@/components/about/ExcellenceAuthenticitySection';
import ClosingStatement from '@/components/about/ClosingStatement';

const About = () => {
  return (
    <div className="min-h-screen">
      <AboutHero />
      <div className="py-32 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <FamilyPhotoSection />
            <FamilyDescription />
          </div>
        </div>
      </div>
      <MissionSection />
      <ValuesSection />
      <ExcellenceAuthenticitySection />
      <ClosingStatement />
    </div>
  );
};

export default About;
