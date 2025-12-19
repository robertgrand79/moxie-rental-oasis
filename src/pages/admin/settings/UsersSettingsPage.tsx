import React from 'react';
import { Users } from 'lucide-react';
import SettingsSidebarLayout from '@/components/admin/settings/SettingsSidebarLayout';
import UserManagementTab from '@/components/admin/user-access/UserManagementTab';

const UsersSettingsPage = () => {
  return (
    <SettingsSidebarLayout 
      title="Users" 
      description="Manage team members"
      icon={Users}
    >
      <UserManagementTab />
    </SettingsSidebarLayout>
  );
};

export default UsersSettingsPage;
