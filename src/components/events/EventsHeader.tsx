
import React from 'react';
import { useTenantSettings } from '@/hooks/useTenantSettings';

const EventsHeader = () => {
  const { settings } = useTenantSettings();
  const locationText = settings.heroLocationText || 'Local';

  return (
    <div className="text-center mb-12">
      <h1 className="text-5xl font-bold text-gray-900 mb-6">
        {locationText} Events
      </h1>
      <div className="w-24 h-1 bg-gradient-to-r from-gradient-from to-gradient-accent-from mx-auto mb-8"></div>
      <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
        Discover what's happening during your stay. From festivals and concerts 
        to outdoor adventures and cultural events.
      </p>
    </div>
  );
};

export default EventsHeader;
