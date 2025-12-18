import React from 'react';
import SettingsSidebarLayout from '@/components/admin/settings/SettingsSidebarLayout';
import UserManagementTab from '@/components/admin/user-access/UserManagementTab';

const UsersSettingsPage = () => {
  return (
    <SettingsSidebarLayout title="Users" description="Manage team members">
      <UserManagementTab />
    </SettingsSidebarLayout>
  );
};

export default UsersSettingsPage;
