import React from 'react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import SettingsPageLayout from '@/components/admin/settings/SettingsPageLayout';
import TemplateSwitcher from '@/components/admin/settings/TemplateSwitcher';

const TemplateSettingsPage: React.FC = () => {
  return (
    <AdminPageWrapper title="Template" description="Choose your site template">
      <SettingsPageLayout title="" description="">
        <TemplateSwitcher />
      </SettingsPageLayout>
    </AdminPageWrapper>
  );
};

export default TemplateSettingsPage;
