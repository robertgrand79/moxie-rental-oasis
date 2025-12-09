import React from 'react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import SettingsPageLayout from '@/components/admin/settings/SettingsPageLayout';
import AppearanceSettingsPanel from '@/components/admin/settings-hub/AppearanceSettingsPanel';

const AppearanceSettingsPage: React.FC = () => {
  return (
    <AdminPageWrapper title="Appearance Settings" description="Customize your site's look">
      <SettingsPageLayout
        title="Appearance"
        description="Colors, fonts, logo, favicon, custom CSS"
      >
        <AppearanceSettingsPanel />
      </SettingsPageLayout>
    </AdminPageWrapper>
  );
};

export default AppearanceSettingsPage;
