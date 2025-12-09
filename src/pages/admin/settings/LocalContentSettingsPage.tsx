import React from 'react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import SettingsPageLayout from '@/components/admin/settings/SettingsPageLayout';
import LocalContentSettingsPanel from '@/components/admin/settings-hub/LocalContentSettingsPanel';

const LocalContentSettingsPage: React.FC = () => {
  return (
    <AdminPageWrapper title="Local Content Settings" description="Manage local content">
      <SettingsPageLayout
        title="Local Content"
        description="Events, places, testimonials & reviews"
      >
        <LocalContentSettingsPanel />
      </SettingsPageLayout>
    </AdminPageWrapper>
  );
};

export default LocalContentSettingsPage;
