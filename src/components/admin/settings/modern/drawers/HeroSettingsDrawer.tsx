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
import HeroSettingsTab from '@/components/admin/settings/HeroSettingsTab';

interface HeroSettingsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const HeroSettingsDrawer: React.FC<HeroSettingsDrawerProps> = ({ open, onOpenChange }) => {
  const { settings, loading, saveSetting } = useSimplifiedSiteSettings();
  const { localData, setLocalData } = useSettingsLocalData(settings, loading);
  const [saving, setSaving] = useState(false);

  const siteData = {
    heroTitle: localData?.siteData?.heroTitle || '',
    heroSubtitle: localData?.siteData?.heroSubtitle || '',
    heroDescription: localData?.siteData?.heroDescription || '',
    heroBackgroundImage: localData?.siteData?.heroBackgroundImage || '',
    heroLocationText: localData?.siteData?.heroLocationText || '',
    heroCTAText: localData?.siteData?.heroCTAText || '',
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
      const fieldsToSave = ['heroTitle', 'heroSubtitle', 'heroDescription', 'heroBackgroundImage', 'heroLocationText', 'heroCTAText'];
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
          <DrawerTitle>Hero Section</DrawerTitle>
          <DrawerDescription>Configure your homepage hero section</DrawerDescription>
        </DrawerHeader>
        <ScrollArea className="flex-1 p-6 max-h-[calc(90vh-100px)]">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : (
            <HeroSettingsTab
              siteData={siteData}
              onInputChange={handleInputChange}
              onSave={handleSave}
            />
          )}
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
};

export default HeroSettingsDrawer;
