
import React from 'react';

interface SettingsInputHandlersProps {
  localData: any;
  setLocalData: React.Dispatch<React.SetStateAction<any>>;
  updateSettingOptimistic: (updates: any) => void;
  children: (handlers: {
    handleInputChange: (field: string, value: string) => void;
    handleSocialMediaChange: (platform: string, value: string) => void;
  }) => React.ReactNode;
}

const SettingsInputHandlers = ({
  localData,
  setLocalData,
  updateSettingOptimistic,
  children
}: SettingsInputHandlersProps) => {
  const handleInputChange = (field: string, value: string) => {
    console.log('[Settings Page] Input change:', field, value);
    setLocalData((prev: any) => ({
      ...prev,
      siteData: {
        ...prev.siteData,
        [field]: value
      }
    }));
    // Optimistic update
    updateSettingOptimistic({ [field]: value });
  };

  const handleSocialMediaChange = (platform: string, value: string) => {
    console.log('[Settings Page] Social media change:', platform, value);
    const newSocialMedia = {
      ...localData.siteData.socialMedia,
      [platform]: value
    };
    setLocalData((prev: any) => ({
      ...prev,
      siteData: {
        ...prev.siteData,
        socialMedia: newSocialMedia
      }
    }));
    updateSettingOptimistic({ socialMedia: newSocialMedia });
  };

  return <>{children({ handleInputChange, handleSocialMediaChange })}</>;
};

export default SettingsInputHandlers;
