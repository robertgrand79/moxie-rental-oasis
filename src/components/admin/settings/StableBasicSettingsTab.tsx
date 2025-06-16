
import React, { useState } from 'react';
import { useStableSiteSettings } from '@/hooks/useStableSiteSettings';
import { useHeroImageUpload } from '@/hooks/useHeroImageUpload';
import { toast } from '@/hooks/use-toast';
import GeneralInformationSettings from './GeneralInformationSettings';
import HeroSectionSettings from './HeroSectionSettings';
import ContactInformationSettings from './ContactInformationSettings';

const StableBasicSettingsTab = () => {
  const { settings, saving, updateSettingOptimistic, saveSettings, refetch } = useStableSiteSettings();
  const { uploadHeroImage } = useHeroImageUpload();
  const [localSettings, setLocalSettings] = useState(settings);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  // Update local state when settings change
  React.useEffect(() => {
    console.log('Settings changed in hook:', settings);
    setLocalSettings(prev => ({
      ...settings,
      // Track original values for comparison
      originalHeroBackgroundImage: settings.heroBackgroundImage
    }));
  }, [settings]);

  const handleInputChange = (field: string, value: string) => {
    console.log('Input changed:', field, value);
    setLocalSettings(prev => ({
      ...prev,
      [field]: value
    }));
    // Optimistic update
    updateSettingOptimistic({ [field]: value } as any);
  };

  const handleImageChange = (imageUrl: string | null) => {
    console.log('Hero image changed:', imageUrl);
    
    // Check if this is a blob URL (preview) and extract the file
    if (imageUrl && imageUrl.startsWith('blob:')) {
      // This is a preview URL, we'll handle the file on save
      setLocalSettings(prev => ({
        ...prev,
        heroBackgroundImage: imageUrl
      }));
      updateSettingOptimistic({ heroBackgroundImage: imageUrl });
    } else {
      // This is either null or a real URL
      setSelectedImageFile(null);
      setLocalSettings(prev => ({
        ...prev,
        heroBackgroundImage: imageUrl
      }));
      updateSettingOptimistic({ heroBackgroundImage: imageUrl });
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
    const success = await saveSettings({
      siteName: localSettings.siteName,
      tagline: localSettings.tagline,
      description: localSettings.description
    });

    if (success) {
      console.log('Basic info saved successfully, refreshing settings...');
      await refetch();
    }
  };

  const handleSaveHeroSettings = async () => {
    console.log('Saving hero settings with image URL:', localSettings.heroBackgroundImage);
    
    let imageUrlToSave = localSettings.heroBackgroundImage;
    
    // If we have a selected file (blob URL), upload it first
    if (localSettings.heroBackgroundImage && localSettings.heroBackgroundImage.startsWith('blob:')) {
      if (selectedImageFile) {
        console.log('Uploading selected image file...');
        const uploadedUrl = await uploadHeroImage(selectedImageFile);
        
        if (uploadedUrl) {
          imageUrlToSave = uploadedUrl;
          setSelectedImageFile(null);
          toast({
            title: 'Image Uploaded Successfully',
            description: 'Your hero image has been uploaded and saved.',
          });
        } else {
          toast({
            title: 'Upload Failed',
            description: 'Failed to upload the image. Please try again.',
            variant: 'destructive'
          });
          return;
        }
      } else {
        // No file but blob URL - this shouldn't happen
        imageUrlToSave = null;
      }
    }
    
    // Convert empty string to null
    if (imageUrlToSave === '') {
      imageUrlToSave = null;
    }
    
    // Validate URL if it's not null
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

    // Refresh settings and update local state if save was successful
    if (success) {
      console.log('Hero settings saved successfully, refreshing settings...');
      await refetch();
      
      // Update local state to reflect the saved value
      setLocalSettings(prev => ({
        ...prev,
        heroBackgroundImage: imageUrlToSave,
        originalHeroBackgroundImage: imageUrlToSave
      }));
    }
  };

  const handleSaveContactInfo = async () => {
    const success = await saveSettings({
      contactEmail: localSettings.contactEmail,
      phone: localSettings.phone,
      address: localSettings.address,
      socialMedia: localSettings.socialMedia
    });

    if (success) {
      console.log('Contact info saved successfully, refreshing settings...');
      await refetch();
    }
  };

  // Check for unsaved changes - use more precise comparison
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

  console.log('Unsaved changes check:', {
    hasUnsavedHeroChanges,
    localHeroImage: localSettings.heroBackgroundImage,
    settingsHeroImage: settings.heroBackgroundImage,
    areEqual: localSettings.heroBackgroundImage === settings.heroBackgroundImage
  });

  // Create a custom image change handler that stores the file
  const handleImageChangeWithFile = (imageUrl: string | null, file?: File) => {
    if (file) {
      setSelectedImageFile(file);
    }
    handleImageChange(imageUrl);
  };

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
        onImageChange={handleImageChangeWithFile}
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
