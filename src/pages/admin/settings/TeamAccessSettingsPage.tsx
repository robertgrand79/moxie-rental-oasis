import React from 'react';
import { UserPlus } from 'lucide-react';
import SettingsSidebarLayout from '@/components/admin/settings/SettingsSidebarLayout';
import TeamAccessSettingsPanel from '@/components/admin/settings-hub/TeamAccessSettingsPanel';

const TeamAccessSettingsPage: React.FC = () => {
  return (
    <SettingsSidebarLayout 
      title="Team & Access" 
      description="Users, roles, permissions, access control"
      icon={UserPlus}
    >
      <TeamAccessSettingsPanel />
    </SettingsSidebarLayout>
  );
};

export default TeamAccessSettingsPage;
