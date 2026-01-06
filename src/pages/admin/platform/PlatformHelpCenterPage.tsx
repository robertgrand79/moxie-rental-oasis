import React from 'react';
import HelpContentManager from '@/components/admin/superadmin/HelpContentManager';

const PlatformHelpCenterPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Help Center</h1>
        <p className="text-muted-foreground">Manage help content and documentation</p>
      </div>
      <HelpContentManager />
    </div>
  );
};

export default PlatformHelpCenterPage;
