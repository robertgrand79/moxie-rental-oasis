import React, { useState } from 'react';
import { Users } from 'lucide-react';
import SettingsSidebarLayout from '@/components/admin/settings/SettingsSidebarLayout';
import { useSimplifiedSiteSettings } from '@/hooks/useSimplifiedSiteSettings';
import { useSettingsLocalData } from '@/hooks/useSettingsLocalData';
import AboutPageSettings from '@/components/admin/settings/AboutPageSettings';

const AboutSettingsPage = () => {
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
      const fieldsToSave = [
        'aboutTitle', 'aboutDescription', 'aboutImageUrl', 'founderNames', 'missionStatement', 'missionDescription',
        'aboutHeroSubtitle', 'aboutFeatureCards', 'aboutFounderQuote', 'aboutTagline', 'aboutTags',
        'aboutMissionCards', 'aboutValuesCards', 'aboutExcellenceTitle', 'aboutExcellenceDescription',
        'aboutAuthenticityTitle', 'aboutAuthenticityDescription', 'aboutClosingQuote'
      ];
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
      <SettingsSidebarLayout 
        title="About Page" 
        description="Configure your about page content"
        icon={Users}
      >
        <div className="text-center py-8 text-muted-foreground">Loading settings...</div>
      </SettingsSidebarLayout>
    );
  }

  if (error) {
    return (
      <SettingsSidebarLayout 
        title="About Page" 
        description="Configure your about page content"
        icon={Users}
      >
        <div className="text-center py-8 text-destructive">Error loading settings: {error}</div>
      </SettingsSidebarLayout>
    );
  }

  return (
    <SettingsSidebarLayout 
      title="About Page" 
      description="Configure your about page content"
      icon={Users}
    >
      <AboutPageSettings
        localData={{
          aboutTitle: localData.siteData.aboutTitle || '',
          aboutDescription: localData.siteData.aboutDescription || '',
          aboutImageUrl: localData.siteData.aboutImageUrl || '',
          founderNames: localData.siteData.founderNames || '',
          missionStatement: localData.siteData.missionStatement || '',
          missionDescription: localData.siteData.missionDescription || '',
          aboutHeroSubtitle: localData.siteData.aboutHeroSubtitle || '',
          aboutFeatureCards: localData.siteData.aboutFeatureCards || '',
          aboutFounderQuote: localData.siteData.aboutFounderQuote || '',
          aboutTagline: localData.siteData.aboutTagline || '',
          aboutTags: localData.siteData.aboutTags || '',
          aboutMissionCards: localData.siteData.aboutMissionCards || '',
          aboutValuesCards: localData.siteData.aboutValuesCards || '',
          aboutExcellenceTitle: localData.siteData.aboutExcellenceTitle || '',
          aboutExcellenceDescription: localData.siteData.aboutExcellenceDescription || '',
          aboutAuthenticityTitle: localData.siteData.aboutAuthenticityTitle || '',
          aboutAuthenticityDescription: localData.siteData.aboutAuthenticityDescription || '',
          aboutClosingQuote: localData.siteData.aboutClosingQuote || ''
        }}
        onInputChange={handleInputChange}
        onSave={handleSave}
        saving={saving}
      />
    </SettingsSidebarLayout>
  );
};

export default AboutSettingsPage;
