import React from 'react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import SettingsPageLayout from '@/components/admin/settings/SettingsPageLayout';
import IntegrationsSettingsPanel from '@/components/admin/settings-hub/IntegrationsSettingsPanel';

const IntegrationsSettingsPage: React.FC = () => {
  return (
    <AdminPageWrapper title="Integrations Settings" description="Manage your integrations">
      <SettingsPageLayout
        title="Integrations"
        description="API connections, webhooks, third-party services"
      >
        <IntegrationsSettingsPanel />
      </SettingsPageLayout>
    </AdminPageWrapper>
  );
};

export default IntegrationsSettingsPage;
