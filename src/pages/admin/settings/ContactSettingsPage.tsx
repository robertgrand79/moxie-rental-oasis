import React, { useState } from 'react';
import { Phone } from 'lucide-react';
import SettingsSidebarLayout from '@/components/admin/settings/SettingsSidebarLayout';
import { useSimplifiedSiteSettings } from '@/hooks/useSimplifiedSiteSettings';
import { useSettingsLocalData } from '@/hooks/useSettingsLocalData';
import ContactInformationSettings from '@/components/admin/settings/ContactInformationSettings';

const ContactSettingsPage = () => {
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
      const fieldsToSave = ['contactEmail', 'phone', 'address'];
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
        title="Contact Info" 
        description="Configure your contact information"
        icon={Phone}
      >
        <div className="text-center py-8 text-muted-foreground">Loading settings...</div>
      </SettingsSidebarLayout>
    );
  }

  if (error) {
    return (
      <SettingsSidebarLayout 
        title="Contact Info" 
        description="Configure your contact information"
        icon={Phone}
      >
        <div className="text-center py-8 text-destructive">Error loading settings: {error}</div>
      </SettingsSidebarLayout>
    );
  }

  return (
    <SettingsSidebarLayout 
      title="Contact Info" 
      description="Configure your contact information"
      icon={Phone}
    >
      <ContactInformationSettings
        localData={{
          contactEmail: localData.siteData.contactEmail || '',
          phone: localData.siteData.phone || '',
          address: localData.siteData.address || ''
        }}
        onInputChange={handleInputChange}
        onSave={handleSave}
        saving={{ contactInfo: saving }}
      />
    </SettingsSidebarLayout>
  );
};

export default ContactSettingsPage;
