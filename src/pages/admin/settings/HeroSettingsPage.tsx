import React, { useState } from 'react';
import SettingsSidebarLayout from '@/components/admin/settings/SettingsSidebarLayout';
import { useSimplifiedSiteSettings } from '@/hooks/useSimplifiedSiteSettings';
import { useSettingsLocalData } from '@/hooks/useSettingsLocalData';
import HeroSectionSettings from '@/components/admin/settings/HeroSectionSettings';

const HeroSettingsPage = () => {
  const { settings, loading, error, saveSetting } = useSimplifiedSiteSettings();
  const { localData, setLocalData } = useSettingsLocalData(settings, loading);
  const [saving, setSaving] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setLocalData((prev: any) => ({
      ...prev,
      siteData: { ...prev.siteData, [field]: value }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fieldsToSave = ['heroTitle', 'heroSubtitle', 'heroDescription', 'heroBackgroundImage', 'heroLocationText', 'heroRating', 'heroCTAText'];
      for (const field of fieldsToSave) {
        const value = localData.siteData[field];
        if (value !== undefined) {
          await saveSetting(field, value);
        }
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SettingsSidebarLayout title="Hero Section" description="Configure your homepage hero">
        <div className="text-center py-8 text-muted-foreground">Loading settings...</div>
      </SettingsSidebarLayout>
    );
  }

  if (error) {
    return (
      <SettingsSidebarLayout title="Hero Section" description="Configure your homepage hero">
        <div className="text-center py-8 text-destructive">Error loading settings: {error}</div>
      </SettingsSidebarLayout>
    );
  }

  return (
    <SettingsSidebarLayout title="Hero Section" description="Configure your homepage hero">
      <HeroSectionSettings
        localData={{
          heroTitle: localData.siteData.heroTitle || '',
          heroSubtitle: localData.siteData.heroSubtitle || '',
          heroDescription: localData.siteData.heroDescription || '',
          heroBackgroundImage: localData.siteData.heroBackgroundImage || '',
          heroLocationText: localData.siteData.heroLocationText || '',
          heroRating: localData.siteData.heroRating || '',
          heroCTAText: localData.siteData.heroCTAText || ''
        }}
        onInputChange={handleInputChange}
        onSave={handleSave}
        saving={{ heroSection: saving }}
      />
    </SettingsSidebarLayout>
  );
};

export default HeroSettingsPage;
