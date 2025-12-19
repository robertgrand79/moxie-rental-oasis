import React from 'react';
import { MapPin } from 'lucide-react';
import SettingsSidebarLayout from '@/components/admin/settings/SettingsSidebarLayout';
import LocalContentSettingsPanel from '@/components/admin/settings-hub/LocalContentSettingsPanel';

const LocalContentSettingsPage: React.FC = () => {
  return (
    <SettingsSidebarLayout 
      title="Local Content" 
      description="Events, places, testimonials & reviews"
      icon={MapPin}
    >
      <LocalContentSettingsPanel />
    </SettingsSidebarLayout>
  );
};

export default LocalContentSettingsPage;
