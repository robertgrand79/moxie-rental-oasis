
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import QuickSetupProgress from './QuickSetupProgress';
import GeneralInformationSettings from './GeneralInformationSettings';
import HeroSectionSettings from './HeroSectionSettings';
import ContactInformationSettings from './ContactInformationSettings';

interface BasicSettingsTabProps {
  siteData: any;
  setSiteData: (data: any) => void;
  updateSetting: (key: string, value: any) => Promise<boolean>;
}

const BasicSettingsTab = ({ siteData, setSiteData, updateSetting }: BasicSettingsTabProps) => {
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setSiteData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSocialMediaChange = (platform: string, value: string) => {
    setSiteData((prev: any) => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }));
  };

  const handleSaveBasicSettings = async () => {
    const settingsToSave = [
      { key: 'siteName', value: siteData.siteName },
      { key: 'tagline', value: siteData.tagline },
      { key: 'description', value: siteData.description },
    ];

    let allSuccessful = true;
    for (const setting of settingsToSave) {
      const success = await updateSetting(setting.key, setting.value);
      if (!success) {
        allSuccessful = false;
      }
    }

    if (allSuccessful) {
      toast({
        title: "Basic Settings Saved",
        description: "Your site information has been successfully updated.",
      });
    }
  };

  const handleSaveHeroSettings = async () => {
    const settingsToSave = [
      { key: 'heroTitle', value: siteData.heroTitle },
      { key: 'heroSubtitle', value: siteData.heroSubtitle },
      { key: 'heroDescription', value: siteData.heroDescription },
      { key: 'heroBackgroundImage', value: siteData.heroBackgroundImage },
      { key: 'heroLocationText', value: siteData.heroLocationText },
      { key: 'heroRating', value: siteData.heroRating },
      { key: 'heroCTAText', value: siteData.heroCTAText },
    ];

    let allSuccessful = true;
    for (const setting of settingsToSave) {
      const success = await updateSetting(setting.key, setting.value);
      if (!success) {
        allSuccessful = false;
      }
    }

    if (allSuccessful) {
      toast({
        title: "Hero Settings Saved",
        description: "Your homepage hero section has been successfully updated.",
      });
    }
  };

  const handleSaveContactSettings = async () => {
    const settingsToSave = [
      { key: 'contactEmail', value: siteData.contactEmail },
      { key: 'phone', value: siteData.phone },
      { key: 'address', value: siteData.address },
      { key: 'socialMedia', value: siteData.socialMedia },
    ];

    let allSuccessful = true;
    for (const setting of settingsToSave) {
      const success = await updateSetting(setting.key, setting.value);
      if (!success) {
        allSuccessful = false;
      }
    }

    if (allSuccessful) {
      toast({
        title: "Contact Settings Saved",
        description: "Your contact information and social media links have been successfully updated.",
      });
    }
  };

  // Calculate completion status
  const isBasicComplete = siteData.siteName && siteData.tagline && siteData.description;
  const isHeroComplete = siteData.heroTitle && siteData.heroSubtitle && siteData.heroDescription;
  const isContactComplete = siteData.contactEmail;

  return (
    <div className="space-y-8">
      <QuickSetupProgress 
        isBasicComplete={isBasicComplete}
        isHeroComplete={isHeroComplete}
        isSocialComplete={isContactComplete}
      />

      <GeneralInformationSettings
        siteData={siteData}
        onInputChange={handleInputChange}
        onSave={handleSaveBasicSettings}
      />

      <HeroSectionSettings
        siteData={siteData}
        onInputChange={handleInputChange}
        onSave={handleSaveHeroSettings}
      />

      <ContactInformationSettings
        siteData={siteData}
        onInputChange={handleInputChange}
        onSocialMediaChange={handleSocialMediaChange}
        onSave={handleSaveContactSettings}
      />
    </div>
  );
};

export default BasicSettingsTab;
