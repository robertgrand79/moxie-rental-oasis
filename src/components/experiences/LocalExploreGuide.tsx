
import React from 'react';
import { useTenantSettings } from '@/hooks/useTenantSettings';

const LocalExploreGuide = () => {
  const { settings } = useTenantSettings();
  const locationText = settings.heroLocationText || 'the Area';

  return (
    <div className="container mx-auto px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 mb-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
          How to Explore {locationText}
        </h2>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              1
            </div>
            <h3 className="text-xl font-semibold mb-2">Discover</h3>
            <p className="text-gray-600">Browse our curated list of local attractions and hidden gems</p>
          </div>
          <div>
            <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              2
            </div>
            <h3 className="text-xl font-semibold mb-2">Plan</h3>
            <p className="text-gray-600">Create your itinerary with distances and directions from your rental</p>
          </div>
          <div>
            <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              3
            </div>
            <h3 className="text-xl font-semibold mb-2">Experience</h3>
            <p className="text-gray-600">Enjoy the area like a local with insider tips and recommendations</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocalExploreGuide;
