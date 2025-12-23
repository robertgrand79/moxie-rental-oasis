import React from 'react';
import { useTenantSettings } from '@/hooks/useTenantSettings';
import { defaultSettings } from '@/hooks/settings/constants';

const AboutHero = () => {
  const { settings } = useTenantSettings();
  const siteName = settings.site_name || 'Our Company';
  const heroSubtitle = settings.aboutHeroSubtitle || defaultSettings.aboutHeroSubtitle;

  return (
    <div className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            About {siteName}
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            {heroSubtitle}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutHero;
