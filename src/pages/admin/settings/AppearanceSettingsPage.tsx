import React from 'react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import SettingsPageLayout from '@/components/admin/settings/SettingsPageLayout';
import ModernAppearanceSettings from '@/components/admin/settings/modern/ModernAppearanceSettings';

const AppearanceSettingsPage: React.FC = () => {
  return (
    <AdminPageWrapper title="Appearance Settings" description="Customize your site's look">
      <SettingsPageLayout
        title=""
        description=""
      >
        <ModernAppearanceSettings />
      </SettingsPageLayout>
    </AdminPageWrapper>
  );
};

export default AppearanceSettingsPage;
