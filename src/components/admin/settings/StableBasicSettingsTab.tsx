import React, { useState } from 'react';
import { useStableSiteSettings } from '@/hooks/useStableSiteSettings';
import GeneralInformationSettings from './GeneralInformationSettings';
import HeroSectionSettings from './HeroSectionSettings';
import ContactInformationSettings from './ContactInformationSettings';

const StableBasicSettingsTab = () => {
  const { settings, saving, updateSettingOptimistic, saveSettings } = useStableSiteSettings();
  const [localSettings, setLocalSettings] = useState(settings);

  // Update local state when settings change
  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleInputChange = (field: string, value: string) => {
    setLocalSettings(prev => ({
      ...prev,
      [field]: value
    }));
    // Optimistic update
    updateSettingOptimistic({ [field]: value } as any);
  };

  const handleImageChange = async (imageUrl: string | null) => {
    const newImageUrl = imageUrl || '';
    
    // Update local state immediately
    setLocalSettings(prev => ({
      ...prev,
      heroBackgroundImage: newImageUrl
    }));
    
    // Update optimistic state immediately
    updateSettingOptimistic({ heroBackgroundImage: newImageUrl });
    
    // Save to database immediately
    const success = await saveSettings({
      heroBackgroundImage: newImageUrl
    });
    
    if (!success) {
      // Revert on failure
      setLocalSettings(prev => ({
        ...prev,
        heroBackgroundImage: settings.heroBackgroundImage
      }));
      updateSettingOptimistic({ heroBackgroundImage: settings.heroBackgroundImage });
    }
  };

  const handleSocialMediaChange = (platform: string, value: string) => {
    const newSocialMedia = {
      ...localSettings.socialMedia,
      [platform]: value
    };
    setLocalSettings(prev => ({
      ...prev,
      socialMedia: newSocialMedia
    }));
    updateSettingOptimistic({ socialMedia: newSocialMedia });
  };

  const handleSaveBasicInfo = async () => {
    await saveSettings({
      siteName: localSettings.siteName,
      tagline: localSettings.tagline,
      description: localSettings.description
    });
  };

  const handleSaveHeroSettings = async () => {
    await saveSettings({
      heroTitle: localSettings.heroTitle,
      heroSubtitle: localSettings.heroSubtitle,
      heroDescription: localSettings.heroDescription,
      heroLocationText: localSettings.heroLocationText,
      heroRating: localSettings.heroRating,
      heroCTAText: localSettings.heroCTAText
    });
  };

  const handleSaveContactInfo = async () => {
    await saveSettings({
      contactEmail: localSettings.contactEmail,
      phone: localSettings.phone,
      address: localSettings.address,
      socialMedia: localSettings.socialMedia
    });
  };

  const isBasicInfoSaving = saving.siteName || saving.tagline || saving.description;
  const isHeroSaving = Object.keys(saving).some(key => key.startsWith('hero') && saving[key]);
  const isContactSaving = saving.contactEmail || saving.phone || saving.address || saving.socialMedia;

  return (
    <div className="space-y-8">
      <GeneralInformationSettings
        siteData={localSettings}
        onInputChange={handleInputChange}
        onSave={handleSaveBasicInfo}
        saving={isBasicInfoSaving}
      />

      <HeroSectionSettings
        siteData={localSettings}
        onInputChange={handleInputChange}
        onImageChange={handleImageChange}
        onSave={handleSaveHeroSettings}
        saving={isHeroSaving}
      />

      <ContactInformationSettings
        siteData={localSettings}
        onInputChange={handleInputChange}
        onSocialMediaChange={handleSocialMediaChange}
        onSave={handleSaveContactInfo}
        saving={isContactSaving}
      />
    </div>
  );
};

export default StableBasicSettingsTab;
