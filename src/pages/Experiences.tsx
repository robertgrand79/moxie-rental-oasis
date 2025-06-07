
import React from 'react';
import ExperienceHero from '@/components/experiences/ExperienceHero';
import ExperienceCategories from '@/components/experiences/ExperienceCategories';
import LocalFavorites from '@/components/experiences/LocalFavorites';
import FeaturedExperiences from '@/components/experiences/FeaturedExperiences';
import HowItWorks from '@/components/experiences/HowItWorks';
import ExperienceCallToAction from '@/components/experiences/ExperienceCallToAction';

const Experiences = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <ExperienceHero />
        <ExperienceCategories />
        <LocalFavorites />
        <FeaturedExperiences />
        <HowItWorks />
        <ExperienceCallToAction />
      </div>
    </div>
  );
};

export default Experiences;
