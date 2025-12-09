
import React from 'react';
import { useTenantSettings } from '@/hooks/useTenantSettings';

const ClosingStatement = () => {
  const { settings } = useTenantSettings();
  const siteName = settings.site_name || 'Our Team';

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-8">
      <div className="max-w-3xl mx-auto text-center">
        <blockquote className="text-xl text-gray-700 italic mb-6 leading-relaxed">
          "Immerse yourself in comfort, style, and hospitality 
          that {siteName} offers, guided by the expertise of our passionate team."
        </blockquote>
        
        <div className="border-t border-gray-200 pt-6">
          <p className="font-semibold text-gray-900">— The {siteName} Team</p>
        </div>
      </div>
    </div>
  );
};

export default ClosingStatement;
