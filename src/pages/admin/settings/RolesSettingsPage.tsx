import React from 'react';
import SettingsSidebarLayout from '@/components/admin/settings/SettingsSidebarLayout';
import RolesPermissionsTab from '@/components/admin/user-access/RolesPermissionsTab';

const RolesSettingsPage = () => {
  return (
    <SettingsSidebarLayout title="Roles & Permissions" description="Manage user roles and permissions">
      <RolesPermissionsTab />
    </SettingsSidebarLayout>
  );
};

export default RolesSettingsPage;
