import React from 'react';
import { Users } from 'lucide-react';
import SettingsSidebarLayout from '@/components/admin/settings/SettingsSidebarLayout';
import UserManagementTab from '@/components/admin/user-access/UserManagementTab';

const TeamSettingsPage = () => {
  return (
    <SettingsSidebarLayout 
      title="Team Management" 
      description="Manage team members, roles, and permissions"
      icon={Users}
    >
      <UserManagementTab />
    </SettingsSidebarLayout>
  );
};

export default TeamSettingsPage;
