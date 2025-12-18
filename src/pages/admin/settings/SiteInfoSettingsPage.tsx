import React, { useState } from 'react';
import SettingsSidebarLayout from '@/components/admin/settings/SettingsSidebarLayout';
import { useSimplifiedSiteSettings } from '@/hooks/useSimplifiedSiteSettings';
import { useSettingsLocalData } from '@/hooks/useSettingsLocalData';
import GeneralInformationSettings from '@/components/admin/settings/GeneralInformationSettings';

const SiteInfoSettingsPage = () => {
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
      const fieldsToSave = ['siteName', 'tagline', 'description'];
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
      <SettingsSidebarLayout title="Site Info" description="Basic site information">
        <div className="text-center py-8 text-muted-foreground">Loading settings...</div>
      </SettingsSidebarLayout>
    );
  }

  if (error) {
    return (
      <SettingsSidebarLayout title="Site Info" description="Basic site information">
        <div className="text-center py-8 text-destructive">Error loading settings: {error}</div>
      </SettingsSidebarLayout>
    );
  }

  return (
    <SettingsSidebarLayout title="Site Info" description="Basic site information">
      <GeneralInformationSettings
        siteData={localData.siteData}
        onInputChange={handleInputChange}
        onSave={handleSave}
        saving={saving}
      />
    </SettingsSidebarLayout>
  );
};

export default SiteInfoSettingsPage;
