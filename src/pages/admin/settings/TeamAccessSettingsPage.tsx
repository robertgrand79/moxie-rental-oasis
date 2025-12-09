import React from 'react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import SettingsPageLayout from '@/components/admin/settings/SettingsPageLayout';
import TeamAccessSettingsPanel from '@/components/admin/settings-hub/TeamAccessSettingsPanel';

const TeamAccessSettingsPage: React.FC = () => {
  return (
    <AdminPageWrapper title="Team & Access Settings" description="Manage your team">
      <SettingsPageLayout
        title="Team & Access"
        description="Users, roles, permissions, access control"
      >
        <TeamAccessSettingsPanel />
      </SettingsPageLayout>
    </AdminPageWrapper>
  );
};

export default TeamAccessSettingsPage;
