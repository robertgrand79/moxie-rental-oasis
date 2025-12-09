
import React from 'react';
import { MapPin } from 'lucide-react';
import { useTenantSettings } from '@/hooks/useTenantSettings';

const LocalExperienceHero = () => {
  const { settings } = useTenantSettings();
  const locationText = settings.heroLocationText || 'the Area';

  return (
    <div className="text-center mb-16 pt-8">
      <MapPin className="h-16 w-16 text-icon-gray mx-auto mb-6" />
      <h1 className="text-5xl font-bold text-gray-900 mb-6">
        Discover {locationText} Like a Local
      </h1>
      <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
        Explore the best of {locationText} with our curated guide to local attractions, outdoor adventures, 
        dining spots, and hidden gems. Your gateway to authentic experiences.
      </p>
    </div>
  );
};

export default LocalExperienceHero;
