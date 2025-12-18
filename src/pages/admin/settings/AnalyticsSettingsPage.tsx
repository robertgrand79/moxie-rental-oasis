import React, { useState } from 'react';
import SettingsSidebarLayout from '@/components/admin/settings/SettingsSidebarLayout';
import { useSimplifiedSiteSettings } from '@/hooks/useSimplifiedSiteSettings';
import { useSettingsLocalData } from '@/hooks/useSettingsLocalData';
import AnalyticsSettingsTab from '@/components/admin/settings/AnalyticsSettingsTab';

const AnalyticsSettingsPage = () => {
  const { settings, loading, error, saveSetting } = useSimplifiedSiteSettings();
  const { localData, setLocalData } = useSettingsLocalData(settings, loading);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const settingsToSave = [
        { key: 'googleAnalyticsId', value: localData.analyticsData.googleAnalyticsId },
        { key: 'googleTagManagerId', value: localData.analyticsData.googleTagManagerId },
        { key: 'facebookPixelId', value: localData.analyticsData.facebookPixelId },
      ];
      for (const setting of settingsToSave) {
        await saveSetting(setting.key, setting.value);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SettingsSidebarLayout title="Analytics" description="Configure analytics tracking">
        <div className="text-center py-8 text-muted-foreground">Loading settings...</div>
      </SettingsSidebarLayout>
    );
  }

  if (error) {
    return (
      <SettingsSidebarLayout title="Analytics" description="Configure analytics tracking">
        <div className="text-center py-8 text-destructive">Error loading settings: {error}</div>
      </SettingsSidebarLayout>
    );
  }

  return (
    <SettingsSidebarLayout title="Analytics" description="Configure analytics tracking">
      <AnalyticsSettingsTab
        analyticsData={localData.analyticsData}
        setAnalyticsData={(data) => setLocalData((prev: any) => ({ ...prev, analyticsData: data }))}
        onSave={handleSave}
      />
    </SettingsSidebarLayout>
  );
};

export default AnalyticsSettingsPage;
