
import React from 'react';
import AboutHero from '@/components/about/AboutHero';
import RobertShellyIntroduction from '@/components/about/RobertShellyIntroduction';
import FamilyDescription from '@/components/about/FamilyDescription';
import FamilyPhotoSection from '@/components/about/FamilyPhotoSection';
import MissionSection from '@/components/about/MissionSection';
import ValuesSection from '@/components/about/ValuesSection';
import ExcellenceAuthenticitySection from '@/components/about/ExcellenceAuthenticitySection';
import ClosingStatement from '@/components/about/ClosingStatement';

const About = () => {
  return (
    <div className="min-h-screen">
      <AboutHero />
      <RobertShellyIntroduction />
      <FamilyDescription />
      <FamilyPhotoSection />
      <MissionSection />
      <ValuesSection />
      <ExcellenceAuthenticitySection />
      <ClosingStatement />
    </div>
  );
};

export default About;
