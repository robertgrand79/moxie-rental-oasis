
import React from 'react';
import PointsOfInterestDisplay from '@/components/experiences/PointsOfInterestDisplay';
import ExperienceHero from '@/components/experiences/ExperienceHero';
import ExperienceCategories from '@/components/experiences/ExperienceCategories';
import HowItWorks from '@/components/experiences/HowItWorks';
import ExperienceCallToAction from '@/components/experiences/ExperienceCallToAction';
import Footer from '@/components/Footer';

const Experiences = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gradient-from to-gradient-to">
      <div className="container mx-auto px-4 py-16">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-16 mx-auto border border-white/20">
          <ExperienceHero />
          <PointsOfInterestDisplay />
          <div className="mt-16">
            <ExperienceCategories />
          </div>
          <div className="mt-16">
            <HowItWorks />
          </div>
          <div className="mt-16">
            <ExperienceCallToAction />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Experiences;
