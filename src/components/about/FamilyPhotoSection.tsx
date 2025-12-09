
import React from 'react';
import { useTenantSettings } from '@/hooks/useTenantSettings';

const FamilyPhotoSection = () => {
  const { settings } = useTenantSettings();
  const founderNames = settings.founderNames || 'Our Team';
  const siteName = settings.site_name || 'Our Team';

  // Only render if tenant has configured about page content
  if (!settings.aboutImageUrl && !settings.founderNames) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Meet Our Team</h3>
        
        {settings.aboutImageUrl && (
          <div className="mb-6">
            <img 
              src={settings.aboutImageUrl}
              alt={`${founderNames} - Team`}
              className="rounded-lg shadow-sm w-full max-w-md mx-auto h-auto object-cover"
            />
          </div>
        )}
        
        <p className="text-gray-600 text-center italic">
          {founderNames} bring expertise and genuine hospitality 
          to every guest experience, ensuring your stay feels like home.
        </p>
      </div>
    </div>
  );
};

export default FamilyPhotoSection;
