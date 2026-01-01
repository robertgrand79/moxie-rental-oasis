import React from 'react';
import SettingsSidebarLayout from '@/components/admin/settings/SettingsSidebarLayout';
import NavigationOrderManager from '@/components/admin/settings/NavigationOrderManager';

const NavigationSettingsPage: React.FC = () => {
  return (
    <SettingsSidebarLayout
      title="Navigation Menu"
      description="Customize the order and visibility of items in your site's navigation menu."
    >
      <div className="max-w-2xl">
        <NavigationOrderManager />
      </div>
    </SettingsSidebarLayout>
  );
};

export default NavigationSettingsPage;
