import React from 'react';
import { Search } from 'lucide-react';
import SettingsSidebarLayout from '@/components/admin/settings/SettingsSidebarLayout';
import SEOSettingsTab from '@/components/admin/settings/SEOSettingsTab';

const SEOSettingsPage = () => {
  return (
    <SettingsSidebarLayout 
      title="SEO" 
      description="Search engine optimization settings"
      icon={Search}
    >
      <SEOSettingsTab />
    </SettingsSidebarLayout>
  );
};

export default SEOSettingsPage;
