import React, { useState } from 'react';
import { Users } from 'lucide-react';
import SettingsSidebarLayout from '@/components/admin/settings/SettingsSidebarLayout';
import { useSimplifiedSiteSettings } from '@/hooks/useSimplifiedSiteSettings';
import { useSettingsLocalData } from '@/hooks/useSettingsLocalData';
import AboutPageSettings from '@/components/admin/settings/AboutPageSettings';
import { useToast } from '@/hooks/use-toast';

const AboutSettingsPage = () => {
  const { settings, loading, error, saveSetting } = useSimplifiedSiteSettings();
  const { localData, setLocalData } = useSettingsLocalData(settings, loading);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setLocalData((prev: any) => ({
      ...prev,
      siteData: { ...prev.siteData, [field]: value }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    let successCount = 0;
    const failedFields: string[] = [];
    
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
          const success = await saveSetting(field, value);
          if (success !== false) {
            successCount++;
          } else {
            failedFields.push(field);
          }
        }
      }

      if (failedFields.length === 0) {
        toast({
          title: "Settings Saved",
          description: "About page settings updated successfully.",
        });
      } else {
        toast({
          title: "Partial Save",
          description: `Some settings failed to save: ${failedFields.join(', ')}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Save Error",
        description: "An unexpected error occurred while saving.",
        variant: "destructive",
      });
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
