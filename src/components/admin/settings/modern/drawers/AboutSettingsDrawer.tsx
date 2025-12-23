import React, { useState } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSimplifiedSiteSettings } from '@/hooks/useSimplifiedSiteSettings';
import { useSettingsLocalData } from '@/hooks/useSettingsLocalData';
import AboutPageSettings from '@/components/admin/settings/AboutPageSettings';

interface AboutSettingsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AboutSettingsDrawer: React.FC<AboutSettingsDrawerProps> = ({ open, onOpenChange }) => {
  const { settings, loading, saveSetting } = useSimplifiedSiteSettings();
  const { localData, setLocalData } = useSettingsLocalData(settings, loading);
  const [saving, setSaving] = useState(false);

  const aboutData = {
    aboutTitle: localData?.siteData?.aboutTitle || '',
    aboutDescription: localData?.siteData?.aboutDescription || '',
    aboutImageUrl: localData?.siteData?.aboutImageUrl || '',
    founderNames: localData?.siteData?.founderNames || '',
    missionStatement: localData?.siteData?.missionStatement || '',
    missionDescription: localData?.siteData?.missionDescription || '',
    aboutHeroSubtitle: localData?.siteData?.aboutHeroSubtitle || '',
    aboutFeatureCards: localData?.siteData?.aboutFeatureCards || '',
    aboutFounderQuote: localData?.siteData?.aboutFounderQuote || '',
    aboutTagline: localData?.siteData?.aboutTagline || '',
    aboutTags: localData?.siteData?.aboutTags || '',
    aboutMissionCards: localData?.siteData?.aboutMissionCards || '',
    aboutValuesCards: localData?.siteData?.aboutValuesCards || '',
    aboutExcellenceTitle: localData?.siteData?.aboutExcellenceTitle || '',
    aboutExcellenceDescription: localData?.siteData?.aboutExcellenceDescription || '',
    aboutAuthenticityTitle: localData?.siteData?.aboutAuthenticityTitle || '',
    aboutAuthenticityDescription: localData?.siteData?.aboutAuthenticityDescription || '',
    aboutClosingQuote: localData?.siteData?.aboutClosingQuote || '',
  };

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

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="border-b">
          <DrawerTitle>About Page</DrawerTitle>
          <DrawerDescription>Mission, story, and team information</DrawerDescription>
        </DrawerHeader>
        <ScrollArea className="flex-1 p-6 max-h-[calc(90vh-100px)]">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : (
            <AboutPageSettings
              localData={aboutData}
              onInputChange={handleInputChange}
              onSave={handleSave}
              saving={saving}
            />
          )}
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
};

export default AboutSettingsDrawer;
