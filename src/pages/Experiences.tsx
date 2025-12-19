import React from 'react';
import LocalExperienceHero from '@/components/experiences/LocalExperienceHero';
import POIMap from '@/components/experiences/POIMap';
import PointsOfInterestDisplay from '@/components/experiences/PointsOfInterestDisplay';
import LocalExploreGuide from '@/components/experiences/LocalExploreGuide';
import LocalExperienceCallToAction from '@/components/experiences/LocalExperienceCallToAction';

const Experiences = () => {
  return (
    <div className="min-h-screen">
      <LocalExperienceHero />
      <POIMap />
      <section className="py-12 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <PointsOfInterestDisplay />
        </div>
      </section>
      <LocalExploreGuide />
      <LocalExperienceCallToAction />
    </div>
  );
};

export default Experiences;
