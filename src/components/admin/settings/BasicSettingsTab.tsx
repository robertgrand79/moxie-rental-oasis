
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import QuickSetupProgress from './QuickSetupProgress';
import GeneralInformationSettings from './GeneralInformationSettings';
import HeroSectionSettings from './HeroSectionSettings';
import ContactInformationSettings from './ContactInformationSettings';
import { useBasicSettingsSave } from '@/hooks/useBasicSettingsSave';

interface BasicSettingsTabProps {
  siteData: any;
  setSiteData: (data: any) => void;
  updateSetting: (key: string, value: any) => Promise<boolean>;
  isUserEditing?: boolean;
}

const BasicSettingsTab = ({ siteData, setSiteData, updateSetting, isUserEditing }: BasicSettingsTabProps) => {
  const { user } = useAuth();

  const { handleSaveBasicSettings, handleSaveHeroSettings, handleSaveContactSettings } = useBasicSettingsSave({
    siteData,
    updateSetting,
  });

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
      />
    </div>
  );
};

export default BasicSettingsTab;
