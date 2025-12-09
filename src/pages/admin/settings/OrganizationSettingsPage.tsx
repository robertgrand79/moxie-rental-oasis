import React from 'react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import SettingsPageLayout from '@/components/admin/settings/SettingsPageLayout';
import OrganizationSettingsPanel from '@/components/admin/settings-hub/OrganizationSettingsPanel';

const OrganizationSettingsPage: React.FC = () => {
  return (
    <AdminPageWrapper title="Organization Settings" description="Manage your organization settings">
      <SettingsPageLayout
        title="Organization"
        description="Name, slug, website, billing & subscription"
      >
        <OrganizationSettingsPanel />
      </SettingsPageLayout>
    </AdminPageWrapper>
  );
};

export default OrganizationSettingsPage;
