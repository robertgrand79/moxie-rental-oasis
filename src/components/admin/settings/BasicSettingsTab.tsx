
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
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
  const { user } = useAuth();

  console.log('BasicSettingsTab - Current user:', user?.id, user?.email);
  console.log('BasicSettingsTab - Current siteData:', siteData);

  const handleInputChange = (field: string, value: string) => {
    console.log('Input change:', field, value);
    setSiteData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSocialMediaChange = (platform: string, value: string) => {
    console.log('Social media change:', platform, value);
    setSiteData((prev: any) => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }));
  };

  const handleSaveBasicSettings = async () => {
    console.log('Saving basic settings...');
    
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to save settings.",
        variant: "destructive"
      });
      return;
    }

    const settingsToSave = [
      { key: 'siteName', value: siteData.siteName },
      { key: 'tagline', value: siteData.tagline },
      { key: 'description', value: siteData.description },
    ];

    console.log('Settings to save:', settingsToSave);

    let allSuccessful = true;
    const failedSettings: string[] = [];

    for (const setting of settingsToSave) {
      console.log('Saving setting:', setting);
      const success = await updateSetting(setting.key, setting.value);
      if (!success) {
        allSuccessful = false;
        failedSettings.push(setting.key);
      }
    }

    if (allSuccessful) {
      toast({
        title: "Basic Settings Saved",
        description: "Your site information has been successfully updated.",
      });
    } else {
      toast({
        title: "Partial Save Error",
        description: `Failed to save: ${failedSettings.join(', ')}`,
        variant: "destructive"
      });
    }
  };

  const handleSaveHeroSettings = async () => {
    console.log('Saving hero settings...');
    
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to save settings.",
        variant: "destructive"
      });
      return;
    }

    const settingsToSave = [
      { key: 'heroTitle', value: siteData.heroTitle },
      { key: 'heroSubtitle', value: siteData.heroSubtitle },
      { key: 'heroDescription', value: siteData.heroDescription },
      { key: 'heroBackgroundImage', value: siteData.heroBackgroundImage },
      { key: 'heroLocationText', value: siteData.heroLocationText },
      { key: 'heroRating', value: siteData.heroRating },
      { key: 'heroCTAText', value: siteData.heroCTAText },
    ];

    console.log('Hero settings to save:', settingsToSave);

    let allSuccessful = true;
    const failedSettings: string[] = [];

    for (const setting of settingsToSave) {
      console.log('Saving hero setting:', setting);
      const success = await updateSetting(setting.key, setting.value);
      if (!success) {
        allSuccessful = false;
        failedSettings.push(setting.key);
      }
    }

    if (allSuccessful) {
      toast({
        title: "Hero Settings Saved",
        description: "Your homepage hero section has been successfully updated.",
      });
    } else {
      toast({
        title: "Partial Save Error",
        description: `Failed to save: ${failedSettings.join(', ')}`,
        variant: "destructive"
      });
    }
  };

  const handleSaveContactSettings = async () => {
    console.log('Saving contact settings...');
    
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to save settings.",
        variant: "destructive"
      });
      return;
    }

    const settingsToSave = [
      { key: 'contactEmail', value: siteData.contactEmail },
      { key: 'phone', value: siteData.phone },
      { key: 'address', value: siteData.address },
      { key: 'socialMedia', value: siteData.socialMedia },
    ];

    console.log('Contact settings to save:', settingsToSave);

    let allSuccessful = true;
    const failedSettings: string[] = [];

    for (const setting of settingsToSave) {
      console.log('Saving contact setting:', setting);
      const success = await updateSetting(setting.key, setting.value);
      if (!success) {
        allSuccessful = false;
        failedSettings.push(setting.key);
      }
    }

    if (allSuccessful) {
      toast({
        title: "Contact Settings Saved",
        description: "Your contact information and social media links have been successfully updated.",
      });
    } else {
      toast({
        title: "Partial Save Error",
        description: `Failed to save: ${failedSettings.join(', ')}`,
        variant: "destructive"
      });
    }
  };

  // Calculate completion status
  const isBasicComplete = siteData.siteName && siteData.tagline && siteData.description;
  const isHeroComplete = siteData.heroTitle && siteData.heroSubtitle && siteData.heroDescription;
  const isContactComplete = siteData.contactEmail;

  return (
    <div className="space-y-8">
      {/* Debug info - remove this after fixing */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm">
        <h4 className="font-medium text-yellow-800 mb-2">Debug Info:</h4>
        <p><strong>User ID:</strong> {user?.id || 'Not logged in'}</p>
        <p><strong>User Email:</strong> {user?.email || 'No email'}</p>
        <p><strong>Site Name:</strong> {siteData.siteName || 'Not set'}</p>
      </div>

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
