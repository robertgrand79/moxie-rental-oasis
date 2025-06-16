
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
    setLocalSettings(prev => ({
      ...settings,
      // Track original values for comparison
      originalHeroBackgroundImage: settings.heroBackgroundImage
    }));
  }, [settings]);

  const handleInputChange = (field: string, value: string) => {
    setLocalSettings(prev => ({
      ...prev,
      [field]: value
    }));
    // Optimistic update
    updateSettingOptimistic({ [field]: value } as any);
  };

  const handleImageChange = (imageUrl: string | null) => {
    console.log('Hero image changed:', imageUrl);
    
    // Store the actual value (null or valid URL) - don't convert to empty string
    setLocalSettings(prev => ({
      ...prev,
      heroBackgroundImage: imageUrl
    }));
    
    // Update optimistic state for immediate UI feedback
    updateSettingOptimistic({ heroBackgroundImage: imageUrl });
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
    console.log('Saving hero settings with image URL:', localSettings.heroBackgroundImage);
    
    // Validate the image URL before saving
    let imageUrlToSave = localSettings.heroBackgroundImage;
    
    // If it's an empty string, convert to null
    if (imageUrlToSave === '') {
      imageUrlToSave = null;
    }
    
    // If it's a non-empty string, validate it's a proper URL
    if (imageUrlToSave && typeof imageUrlToSave === 'string') {
      try {
        new URL(imageUrlToSave);
        console.log('Valid URL detected:', imageUrlToSave);
      } catch (error) {
        console.error('Invalid URL detected:', imageUrlToSave, error);
        imageUrlToSave = null;
      }
    }
    
    console.log('Final image URL to save:', imageUrlToSave);
    
    // Save ALL hero settings including the validated image
    const success = await saveSettings({
      heroTitle: localSettings.heroTitle,
      heroSubtitle: localSettings.heroSubtitle,
      heroDescription: localSettings.heroDescription,
      heroBackgroundImage: imageUrlToSave,
      heroLocationText: localSettings.heroLocationText,
      heroRating: localSettings.heroRating,
      heroCTAText: localSettings.heroCTAText
    });

    // Update original values if save was successful
    if (success) {
      setLocalSettings(prev => ({
        ...prev,
        originalHeroBackgroundImage: imageUrlToSave
      }));
    }
  };

  const handleSaveContactInfo = async () => {
    await saveSettings({
      contactEmail: localSettings.contactEmail,
      phone: localSettings.phone,
      address: localSettings.address,
      socialMedia: localSettings.socialMedia
    });
  };

  // Check for unsaved changes
  const hasUnsavedBasicChanges = 
    localSettings.siteName !== settings.siteName ||
    localSettings.tagline !== settings.tagline ||
    localSettings.description !== settings.description;

  const hasUnsavedHeroChanges = 
    localSettings.heroTitle !== settings.heroTitle ||
    localSettings.heroSubtitle !== settings.heroSubtitle ||
    localSettings.heroDescription !== settings.heroDescription ||
    localSettings.heroBackgroundImage !== settings.heroBackgroundImage ||
    localSettings.heroLocationText !== settings.heroLocationText ||
    localSettings.heroRating !== settings.heroRating ||
    localSettings.heroCTAText !== settings.heroCTAText;

  const hasUnsavedContactChanges = 
    localSettings.contactEmail !== settings.contactEmail ||
    localSettings.phone !== settings.phone ||
    localSettings.address !== settings.address ||
    JSON.stringify(localSettings.socialMedia) !== JSON.stringify(settings.socialMedia);

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
        hasUnsavedChanges={hasUnsavedBasicChanges}
      />

      <HeroSectionSettings
        siteData={localSettings}
        onInputChange={handleInputChange}
        onImageChange={handleImageChange}
        onSave={handleSaveHeroSettings}
        saving={isHeroSaving}
        hasUnsavedChanges={hasUnsavedHeroChanges}
      />

      <ContactInformationSettings
        siteData={localSettings}
        onInputChange={handleInputChange}
        onSocialMediaChange={handleSocialMediaChange}
        onSave={handleSaveContactInfo}
        saving={isContactSaving}
        hasUnsavedChanges={hasUnsavedContactChanges}
      />
    </div>
  );
};

export default StableBasicSettingsTab;
