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
import ContactInformationSettings from '@/components/admin/settings/ContactInformationSettings';

interface ContactSettingsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ContactSettingsDrawer: React.FC<ContactSettingsDrawerProps> = ({ open, onOpenChange }) => {
  const { settings, loading, saveSetting } = useSimplifiedSiteSettings();
  const { localData, setLocalData } = useSettingsLocalData(settings, loading);
  const [savingFields, setSavingFields] = useState<Record<string, boolean>>({});

  const contactData = {
    contactEmail: localData?.siteData?.contactEmail || '',
    phone: localData?.siteData?.phone || '',
    address: localData?.siteData?.address || '',
  };

  const handleInputChange = (field: string, value: string) => {
    setLocalData((prev: any) => ({
      ...prev,
      siteData: { ...prev.siteData, [field]: value }
    }));
  };

  const handleSave = async () => {
    setSavingFields({ contactEmail: true, phone: true, address: true });
    try {
      const fieldsToSave = ['contactEmail', 'phone', 'address'];
      for (const field of fieldsToSave) {
        const value = localData.siteData[field];
        if (value !== undefined) {
          await saveSetting(field, value);
        }
      }
    } finally {
      setSavingFields({});
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="border-b">
          <DrawerTitle>Contact Information</DrawerTitle>
          <DrawerDescription>Email, phone, and address details</DrawerDescription>
        </DrawerHeader>
        <ScrollArea className="flex-1 p-6 max-h-[calc(90vh-100px)]">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : (
            <ContactInformationSettings
              localData={contactData}
              onInputChange={handleInputChange}
              onSave={handleSave}
              saving={savingFields}
            />
          )}
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  );
};

export default ContactSettingsDrawer;
