import React from 'react';
import { Share2 } from 'lucide-react';
import SettingsSidebarLayout from '@/components/admin/settings/SettingsSidebarLayout';
import { useSimplifiedSiteSettings } from '@/hooks/useSimplifiedSiteSettings';
import SocialSettingsTab from '@/components/admin/settings/SocialSettingsTab';

const SocialSettingsPage = () => {
  const { settings, loading, error, saveSetting } = useSimplifiedSiteSettings();

  if (loading) {
    return (
      <SettingsSidebarLayout 
        title="Social & Media" 
        description="Configure social media links and media feeds"
        icon={Share2}
      >
        <div className="text-center py-8 text-muted-foreground">Loading settings...</div>
      </SettingsSidebarLayout>
    );
  }

  if (error) {
    return (
      <SettingsSidebarLayout 
        title="Social & Media" 
        description="Configure social media links and media feeds"
        icon={Share2}
      >
        <div className="text-center py-8 text-destructive">Error loading settings: {error}</div>
      </SettingsSidebarLayout>
    );
  }

  return (
    <SettingsSidebarLayout 
      title="Social & Media" 
      description="Configure social media links and media feeds"
      icon={Share2}
    >
      <SocialSettingsTab
        siteData={settings}
        onSocialMediaChange={(platform, value) => {
          saveSetting('socialMedia', { ...settings.socialMedia, [platform]: value });
        }}
        onSettingChange={(key, value) => {
          saveSetting(key, value);
        }}
        onSave={() => {}}
      />
    </SettingsSidebarLayout>
  );
};

export default SocialSettingsPage;
