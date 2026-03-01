import React from 'react';
import { Tv, Construction } from 'lucide-react';
import SettingsSidebarLayout from '@/components/admin/settings/SettingsSidebarLayout';
import { Card, CardContent } from '@/components/ui/card';

const TVDevicesSettingsPage = () => {
  return (
    <SettingsSidebarLayout 
      title="TV Devices" 
      description="Manage TV devices and guest portal displays"
      icon={Tv}
    >
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Construction className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            TV device management is currently under development. Stay tuned for updates!
          </p>
        </CardContent>
      </Card>
    </SettingsSidebarLayout>
  );
};

export default TVDevicesSettingsPage;
