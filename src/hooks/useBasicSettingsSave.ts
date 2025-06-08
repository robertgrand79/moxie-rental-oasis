
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface UseBasicSettingsSaveProps {
  siteData: any;
  updateSetting: (key: string, value: any) => Promise<boolean>;
}

export const useBasicSettingsSave = ({ siteData, updateSetting }: UseBasicSettingsSaveProps) => {
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSaveBasicSettings = async () => {
    console.log('💾 Saving basic settings...');
    
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

    console.log('📝 Settings to save:', settingsToSave);

    let allSuccessful = true;
    const failedSettings: string[] = [];

    for (const setting of settingsToSave) {
      console.log('💾 Saving setting:', setting);
      try {
        const success = await updateSetting(setting.key, setting.value);
        if (!success) {
          allSuccessful = false;
          failedSettings.push(setting.key);
        }
      } catch (error) {
        console.error('❌ Error saving setting:', setting.key, error);
        allSuccessful = false;
        failedSettings.push(setting.key);
      }
    }

    if (allSuccessful) {
      toast({
        title: "Success!",
        description: "Your basic settings have been saved successfully.",
      });
    } else {
      toast({
        title: "Partial Save Error",
        description: `Failed to save: ${failedSettings.join(', ')}. Please try again.`,
        variant: "destructive"
      });
    }
  };

  const handleSaveHeroSettings = async () => {
    console.log('🦸 Saving hero settings...');
    
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

    console.log('🎬 Hero settings to save:', settingsToSave);

    let allSuccessful = true;
    const failedSettings: string[] = [];

    for (const setting of settingsToSave) {
      console.log('💾 Saving hero setting:', setting);
      try {
        const success = await updateSetting(setting.key, setting.value);
        if (!success) {
          allSuccessful = false;
          failedSettings.push(setting.key);
        }
      } catch (error) {
        console.error('❌ Error saving hero setting:', setting.key, error);
        allSuccessful = false;
        failedSettings.push(setting.key);
      }
    }

    if (allSuccessful) {
      toast({
        title: "Success!",
        description: "Your hero section has been updated successfully.",
      });
    } else {
      toast({
        title: "Partial Save Error",
        description: `Failed to save: ${failedSettings.join(', ')}. Please try again.`,
        variant: "destructive"
      });
    }
  };

  const handleSaveContactSettings = async () => {
    console.log('📞 Saving contact settings...');
    
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

    console.log('📧 Contact settings to save:', settingsToSave);

    let allSuccessful = true;
    const failedSettings: string[] = [];

    for (const setting of settingsToSave) {
      console.log('💾 Saving contact setting:', setting);
      try {
        const success = await updateSetting(setting.key, setting.value);
        if (!success) {
          allSuccessful = false;
          failedSettings.push(setting.key);
        }
      } catch (error) {
        console.error('❌ Error saving contact setting:', setting.key, error);
        allSuccessful = false;
        failedSettings.push(setting.key);
      }
    }

    if (allSuccessful) {
      toast({
        title: "Success!",
        description: "Your contact information has been updated successfully.",
      });
    } else {
      toast({
        title: "Partial Save Error",
        description: `Failed to save: ${failedSettings.join(', ')}. Please try again.`,
        variant: "destructive"
      });
    }
  };

  return {
    handleSaveBasicSettings,
    handleSaveHeroSettings,
    handleSaveContactSettings,
  };
};
