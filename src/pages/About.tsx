
import React from 'react';
import AboutHero from '@/components/about/AboutHero';
import RobertShellyIntroduction from '@/components/about/RobertShellyIntroduction';
import MissionSection from '@/components/about/MissionSection';
import ValuesSection from '@/components/about/ValuesSection';
import ExcellenceAuthenticitySection from '@/components/about/ExcellenceAuthenticitySection';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AboutHero />
      <div className="container mx-auto px-4 py-8 space-y-8">
        <RobertShellyIntroduction />
        <MissionSection />
        <ValuesSection />
        <ExcellenceAuthenticitySection />
      </div>
    </div>
  );
};

export default About;
