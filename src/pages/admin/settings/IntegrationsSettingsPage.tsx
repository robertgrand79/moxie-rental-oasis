import React from 'react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import SettingsPageLayout from '@/components/admin/settings/SettingsPageLayout';
import ModernIntegrationsSettings from '@/components/admin/settings/modern/ModernIntegrationsSettings';

const IntegrationsSettingsPage: React.FC = () => {
  return (
    <AdminPageWrapper title="Integrations Settings" description="Manage your integrations">
      <SettingsPageLayout
        title=""
        description=""
      >
        <ModernIntegrationsSettings />
      </SettingsPageLayout>
    </AdminPageWrapper>
  );
};

export default IntegrationsSettingsPage;
