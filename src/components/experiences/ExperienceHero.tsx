
import React from 'react';
import { Compass } from 'lucide-react';

const ExperienceHero = () => {
  return (
    <div className="text-center mb-16">
      <Compass className="h-16 w-16 text-primary mx-auto mb-6" />
      <h1 className="text-5xl font-bold text-gray-900 mb-6">
        Unforgettable Experiences
      </h1>
      <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
        Transform your vacation into an adventure. Discover unique experiences 
        curated by local experts to help you explore, learn, and create lasting memories.
      </p>
    </div>
  );
};

export default ExperienceHero;
