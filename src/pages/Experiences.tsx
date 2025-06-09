
import React from 'react';
import ExperienceHero from '@/components/experiences/ExperienceHero';
import ExperienceCategories from '@/components/experiences/ExperienceCategories';
import FeaturedExperiences from '@/components/experiences/FeaturedExperiences';
import LocalFavorites from '@/components/experiences/LocalFavorites';
import HowItWorks from '@/components/experiences/HowItWorks';
import ExperienceCallToAction from '@/components/experiences/ExperienceCallToAction';
import PointsOfInterestDisplay from '@/components/experiences/PointsOfInterestDisplay';

const Experiences = () => {
  return (
    <div className="min-h-screen">
      <ExperienceHero />
      <ExperienceCategories />
      <FeaturedExperiences />
      <PointsOfInterestDisplay />
      <LocalFavorites />
      <HowItWorks />
      <ExperienceCallToAction />
    </div>
  );
};

export default Experiences;
