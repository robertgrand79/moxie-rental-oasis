import React from 'react';
import PlatformStripeSettings from '@/components/admin/superadmin/PlatformStripeSettings';

const PlatformSettingsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Platform Settings</h1>
        <p className="text-muted-foreground">Configure platform-wide settings</p>
      </div>
      <PlatformStripeSettings />
    </div>
  );
};

export default PlatformSettingsPage;
