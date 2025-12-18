import React from 'react';
import SettingsSidebarLayout from '@/components/admin/settings/SettingsSidebarLayout';
import DomainSettingsTab from '@/components/admin/settings-hub/DomainSettingsTab';

const DomainSettingsPage = () => {
  return (
    <SettingsSidebarLayout title="Domain" description="Configure your custom domain settings">
      <DomainSettingsTab />
    </SettingsSidebarLayout>
  );
};

export default DomainSettingsPage;
