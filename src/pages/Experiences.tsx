
import React from 'react';
import LocalExperienceHero from '@/components/experiences/LocalExperienceHero';
import EugeneExperienceCategories from '@/components/experiences/EugeneExperienceCategories';
import LocalHighlights from '@/components/experiences/LocalHighlights';
import PointsOfInterestDisplay from '@/components/experiences/PointsOfInterestDisplay';
import LocalFavorites from '@/components/experiences/LocalFavorites';
import LocalExploreGuide from '@/components/experiences/LocalExploreGuide';
import LocalExperienceCallToAction from '@/components/experiences/LocalExperienceCallToAction';

const Experiences = () => {
  return (
    <div className="min-h-screen">
      <LocalExperienceHero />
      <EugeneExperienceCategories />
      <LocalHighlights />
      <PointsOfInterestDisplay />
      <LocalFavorites />
      <LocalExploreGuide />
      <LocalExperienceCallToAction />
    </div>
  );
};

export default Experiences;
