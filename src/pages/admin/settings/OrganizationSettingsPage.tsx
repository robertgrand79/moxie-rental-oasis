import React from 'react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import SettingsPageLayout from '@/components/admin/settings/SettingsPageLayout';
import ModernOrganizationSettings from '@/components/admin/settings/modern/ModernOrganizationSettings';

const OrganizationSettingsPage: React.FC = () => {
  return (
    <AdminPageWrapper title="Organization Settings" description="Manage your organization settings">
      <SettingsPageLayout
        title=""
        description=""
      >
        <ModernOrganizationSettings />
      </SettingsPageLayout>
    </AdminPageWrapper>
  );
};

export default OrganizationSettingsPage;
