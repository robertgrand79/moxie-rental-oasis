
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSimplifiedSiteSettings } from '@/hooks/useSimplifiedSiteSettings';

interface DebugInfoPanelProps {
  siteData: any;
  isUserEditing?: boolean;
}

const DebugInfoPanel = ({ siteData, isUserEditing }: DebugInfoPanelProps) => {
  const { user } = useAuth();
  const { settings } = useSimplifiedSiteSettings();

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
      <h4 className="font-medium text-blue-800 mb-2">🔍 Debug Information:</h4>
      <div className="space-y-1 text-blue-700">
        <p><strong>User ID:</strong> {user?.id || 'Not logged in'}</p>
        <p><strong>User Email:</strong> {user?.email || 'No email'}</p>
        <p><strong>User Editing:</strong> {isUserEditing ? 'Yes' : 'No'}</p>
        <p><strong>Settings in DB:</strong> {Object.keys(settings).length} entries</p>
        
        <div className="mt-3 border-t pt-2">
          <p className="font-medium">Form State vs Database:</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <p><strong>Site Name (Form):</strong> "{siteData.siteName || 'empty'}"</p>
              <p><strong>Site Name (DB):</strong> "{settings.siteName || 'not set'}"</p>
            </div>
            <div>
              <p><strong>Tagline (Form):</strong> "{siteData.tagline || 'empty'}"</p>
              <p><strong>Tagline (DB):</strong> "{settings.tagline || 'not set'}"</p>
            </div>
            <div>
              <p><strong>Hero Title (Form):</strong> "{siteData.heroTitle || 'empty'}"</p>
              <p><strong>Hero Title (DB):</strong> "{settings.heroTitle || 'not set'}"</p>
            </div>
            <div>
              <p><strong>Contact Email (Form):</strong> "{siteData.contactEmail || 'empty'}"</p>
              <p><strong>Contact Email (DB):</strong> "{settings.contactEmail || 'not set'}"</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugInfoPanel;
