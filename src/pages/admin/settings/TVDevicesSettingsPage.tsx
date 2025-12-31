import React from 'react';
import { Tv } from 'lucide-react';
import SettingsSidebarLayout from '@/components/admin/settings/SettingsSidebarLayout';
import TVDevicesSettingsTab from '@/components/admin/settings/TVDevicesSettingsTab';

const TVDevicesSettingsPage = () => {
  return (
    <SettingsSidebarLayout 
      title="TV Devices" 
      description="Manage Guidio TV devices and guest portal displays"
      icon={Tv}
    >
      <TVDevicesSettingsTab />
    </SettingsSidebarLayout>
  );
};

export default TVDevicesSettingsPage;
