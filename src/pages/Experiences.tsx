
import React from 'react';
import PointsOfInterestDisplay from '@/components/experiences/PointsOfInterestDisplay';
import ExperienceHero from '@/components/experiences/ExperienceHero';
import ExperienceCategories from '@/components/experiences/ExperienceCategories';
import HowItWorks from '@/components/experiences/HowItWorks';
import ExperienceCallToAction from '@/components/experiences/ExperienceCallToAction';
import BackgroundWrapper from '@/components/home/BackgroundWrapper';

const Experiences = () => {
  return (
    <BackgroundWrapper>
      <div className="min-h-screen">
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
      </div>
    </BackgroundWrapper>
  );
};

export default Experiences;
