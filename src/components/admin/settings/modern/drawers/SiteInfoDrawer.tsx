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
import GeneralInformationSettings from '@/components/admin/settings/GeneralInformationSettings';

interface SiteInfoDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SiteInfoDrawer: React.FC<SiteInfoDrawerProps> = ({ open, onOpenChange }) => {
  const { settings, loading, saveSetting } = useSimplifiedSiteSettings();
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

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="border-b">
          <DrawerTitle>Site Information</DrawerTitle>
          <DrawerDescription>Basic site name, tagline, and description</DrawerDescription>
        </DrawerHeader>
        <ScrollArea className="flex-1 p-6 max-h-[calc(90vh-100px)]">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : (
            <GeneralInformationSettings
              siteData={localData.siteData}
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

export default SiteInfoDrawer;
