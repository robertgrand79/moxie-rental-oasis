import React from 'react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import SettingsPageLayout from '@/components/admin/settings/SettingsPageLayout';
import SiteContentSettingsPanel from '@/components/admin/settings-hub/SiteContentSettingsPanel';

const SiteContentSettingsPage: React.FC = () => {
  return (
    <AdminPageWrapper title="Site & Content Settings" description="Manage your site content">
      <SettingsPageLayout
        title="Site & Content"
        description="Site info, hero section, contact, SEO, analytics"
      >
        <SiteContentSettingsPanel />
      </SettingsPageLayout>
    </AdminPageWrapper>
  );
};

export default SiteContentSettingsPage;
