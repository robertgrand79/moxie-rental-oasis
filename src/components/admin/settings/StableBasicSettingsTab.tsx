
import React from 'react';
import { useSimplifiedSiteSettings } from '@/hooks/useSimplifiedSiteSettings';
import { useBasicSettingsSave } from '@/hooks/useBasicSettingsSave';
import StaticSettingsSyncButton from './StaticSettingsSyncButton';
import BasicSiteInformation from './BasicSiteInformation';
import HeroSectionSettings from './HeroSectionSettings';
import ContactInformationSettings from './ContactInformationSettings';

const StableBasicSettingsTab = () => {
  const { settings, saving, updateSettingOptimistic, saveSetting } = useSimplifiedSiteSettings();
  
  const [localData, setLocalData] = React.useState({
    siteName: settings.siteName || '',
    siteLogo: settings.siteLogo || '',
    tagline: settings.tagline || '',
    description: settings.description || '',
    heroTitle: settings.heroTitle || '',
    heroSubtitle: settings.heroSubtitle || '',
    heroDescription: settings.heroDescription || '',
    heroBackgroundImage: settings.heroBackgroundImage || '',
    heroLocationText: settings.heroLocationText || '',
    heroRating: settings.heroRating || '',
    heroCTAText: settings.heroCTAText || '',
    contactEmail: settings.contactEmail || '',
    phone: settings.phone || '',
    address: settings.address || '',
    socialMedia: settings.socialMedia || {
      facebook: '',
      instagram: '',
      twitter: '',
      googlePlaces: ''
    }
  });

  React.useEffect(() => {
    setLocalData({
      siteName: settings.siteName || '',
      siteLogo: settings.siteLogo || '',
      tagline: settings.tagline || '',
      description: settings.description || '',
      heroTitle: settings.heroTitle || '',
      heroSubtitle: settings.heroSubtitle || '',
      heroDescription: settings.heroDescription || '',
      heroBackgroundImage: settings.heroBackgroundImage || '',
      heroLocationText: settings.heroLocationText || '',
      heroRating: settings.heroRating || '',
      heroCTAText: settings.heroCTAText || '',
      contactEmail: settings.contactEmail || '',
      phone: settings.phone || '',
      address: settings.address || '',
      socialMedia: settings.socialMedia || {
        facebook: '',
        instagram: '',
        twitter: '',
        googlePlaces: ''
      }
    });
  }, [settings]);

  const handleInputChange = (field: string, value: string) => {
    setLocalData(prev => ({
      ...prev,
      [field]: value
    }));
    updateSettingOptimistic({ [field]: value } as any);
  };

  const { handleSaveBasicSettings, handleSaveHeroSettings, handleSaveContactSettings } = useBasicSettingsSave({
    siteData: localData,
    updateSetting: saveSetting
  });

  return (
    <div className="space-y-8">
      {/* Static Settings Sync Section */}
      <StaticSettingsSyncButton />

      {/* Basic Site Information */}
      <BasicSiteInformation
        localData={{
          siteName: localData.siteName,
          siteLogo: localData.siteLogo,
          tagline: localData.tagline,
          description: localData.description
        }}
        onInputChange={handleInputChange}
        onSave={handleSaveBasicSettings}
        saving={saving}
      />

      {/* Hero Section Settings */}
      <HeroSectionSettings
        localData={{
          heroTitle: localData.heroTitle,
          heroSubtitle: localData.heroSubtitle,
          heroDescription: localData.heroDescription,
          heroBackgroundImage: localData.heroBackgroundImage,
          heroLocationText: localData.heroLocationText,
          heroRating: localData.heroRating,
          heroCTAText: localData.heroCTAText
        }}
        onInputChange={handleInputChange}
        onSave={handleSaveHeroSettings}
        saving={saving}
      />

      {/* Contact Information */}
      <ContactInformationSettings
        localData={{
          contactEmail: localData.contactEmail,
          phone: localData.phone,
          address: localData.address
        }}
        onInputChange={handleInputChange}
        onSave={handleSaveContactSettings}
        saving={saving}
      />
    </div>
  );
};

export default StableBasicSettingsTab;
