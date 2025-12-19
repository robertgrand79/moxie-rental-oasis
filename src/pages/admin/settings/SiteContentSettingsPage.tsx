import React from 'react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import SettingsPageLayout from '@/components/admin/settings/SettingsPageLayout';
import ModernSiteContentSettings from '@/components/admin/settings/modern/ModernSiteContentSettings';

const SiteContentSettingsPage: React.FC = () => {
  return (
    <AdminPageWrapper title="Site & Content Settings" description="Manage your site content">
      <SettingsPageLayout
        title=""
        description=""
      >
        <ModernSiteContentSettings />
      </SettingsPageLayout>
    </AdminPageWrapper>
  );
};

export default SiteContentSettingsPage;
