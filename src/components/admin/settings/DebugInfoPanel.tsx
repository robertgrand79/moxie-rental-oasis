
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface DebugInfoPanelProps {
  siteData: any;
}

const DebugInfoPanel = ({ siteData }: DebugInfoPanelProps) => {
  const { user } = useAuth();

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
      <h4 className="font-medium text-blue-800 mb-2">🔍 Debug Information:</h4>
      <div className="space-y-1 text-blue-700">
        <p><strong>User ID:</strong> {user?.id || 'Not logged in'}</p>
        <p><strong>User Email:</strong> {user?.email || 'No email'}</p>
        <p><strong>Site Name (Form):</strong> {siteData.siteName || 'Not set'}</p>
        <p><strong>Hero Title (Form):</strong> {siteData.heroTitle || 'Not set'}</p>
        <p><strong>Contact Email (Form):</strong> {siteData.contactEmail || 'Not set'}</p>
      </div>
    </div>
  );
};

export default DebugInfoPanel;
