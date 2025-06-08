
import { useToast } from '@/hooks/use-toast';

interface UseBasicSettingsSaveProps {
  siteData: any;
  updateSetting: (key: string, value: any) => Promise<boolean>;
}

export const useBasicSettingsSave = ({ siteData, updateSetting }: UseBasicSettingsSaveProps) => {
  const { toast } = useToast();

  const handleSaveBasicSettings = async () => {
    console.log('💾 Saving basic settings:', { 
      siteName: siteData.siteName, 
      tagline: siteData.tagline, 
      description: siteData.description 
    });

    // Validate required fields
    if (!siteData.siteName?.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Site name is required.',
        variant: 'destructive'
      });
      return;
    }

    if (!siteData.tagline?.trim()) {
      toast({
        title: 'Validation Error', 
        description: 'Tagline is required.',
        variant: 'destructive'
      });
      return;
    }

    if (!siteData.description?.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Site description is required.',
        variant: 'destructive'
      });
      return;
    }

    const settingsToSave = [
      { key: 'siteName', value: siteData.siteName },
      { key: 'tagline', value: siteData.tagline },
      { key: 'description', value: siteData.description }
    ];

    let successCount = 0;
    let failureCount = 0;

    for (const setting of settingsToSave) {
      console.log(`🔄 Saving ${setting.key}:`, setting.value);
      const success = await updateSetting(setting.key, setting.value);
      if (success) {
        successCount++;
        console.log(`✅ Successfully saved ${setting.key}`);
      } else {
        failureCount++;
        console.error(`❌ Failed to save ${setting.key}`);
      }
    }

    if (successCount === settingsToSave.length) {
      toast({
        title: "Settings Saved",
        description: "Basic site information has been successfully updated.",
      });
    } else if (successCount > 0) {
      toast({
        title: "Partially Saved",
        description: `${successCount} of ${settingsToSave.length} settings saved. ${failureCount} failed.`,
        variant: 'destructive'
      });
    } else {
      toast({
        title: "Save Failed",
        description: "Failed to save basic settings. Please try again.",
        variant: 'destructive'
      });
    }
  };

  const handleSaveHeroSettings = async () => {
    console.log('💾 Saving hero settings:', { 
      heroTitle: siteData.heroTitle, 
      heroSubtitle: siteData.heroSubtitle, 
      heroDescription: siteData.heroDescription 
    });

    // Validate required fields
    if (!siteData.heroTitle?.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Hero title is required.',
        variant: 'destructive'
      });
      return;
    }

    if (!siteData.heroDescription?.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Hero description is required.',
        variant: 'destructive'
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
      { key: 'heroCTAText', value: siteData.heroCTAText }
    ];

    let successCount = 0;
    let failureCount = 0;

    for (const setting of settingsToSave) {
      console.log(`🔄 Saving ${setting.key}:`, setting.value);
      const success = await updateSetting(setting.key, setting.value);
      if (success) {
        successCount++;
        console.log(`✅ Successfully saved ${setting.key}`);
      } else {
        failureCount++;
        console.error(`❌ Failed to save ${setting.key}`);
      }
    }

    if (successCount === settingsToSave.length) {
      toast({
        title: "Hero Settings Saved",
        description: "Hero section has been successfully updated.",
      });
    } else if (successCount > 0) {
      toast({
        title: "Partially Saved",
        description: `${successCount} of ${settingsToSave.length} hero settings saved. ${failureCount} failed.`,
        variant: 'destructive'
      });
    } else {
      toast({
        title: "Save Failed",
        description: "Failed to save hero settings. Please try again.",
        variant: 'destructive'
      });
    }
  };

  const handleSaveContactSettings = async () => {
    console.log('💾 Saving contact settings:', { 
      contactEmail: siteData.contactEmail, 
      phone: siteData.phone, 
      address: siteData.address,
      socialMedia: siteData.socialMedia
    });

    // Validate required fields
    if (!siteData.contactEmail?.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Contact email is required.',
        variant: 'destructive'
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(siteData.contactEmail)) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid email address.',
        variant: 'destructive'
      });
      return;
    }

    const settingsToSave = [
      { key: 'contactEmail', value: siteData.contactEmail },
      { key: 'phone', value: siteData.phone },
      { key: 'address', value: siteData.address },
      { key: 'socialMedia', value: siteData.socialMedia }
    ];

    let successCount = 0;
    let failureCount = 0;

    for (const setting of settingsToSave) {
      console.log(`🔄 Saving ${setting.key}:`, setting.value);
      const success = await updateSetting(setting.key, setting.value);
      if (success) {
        successCount++;
        console.log(`✅ Successfully saved ${setting.key}`);
      } else {
        failureCount++;
        console.error(`❌ Failed to save ${setting.key}`);
      }
    }

    if (successCount === settingsToSave.length) {
      toast({
        title: "Contact Settings Saved",
        description: "Contact information has been successfully updated.",
      });
    } else if (successCount > 0) {
      toast({
        title: "Partially Saved",
        description: `${successCount} of ${settingsToSave.length} contact settings saved. ${failureCount} failed.`,
        variant: 'destructive'
      });
    } else {
      toast({
        title: "Save Failed",
        description: "Failed to save contact settings. Please try again.",
        variant: 'destructive'
      });
    }
  };

  return {
    handleSaveBasicSettings,
    handleSaveHeroSettings,
    handleSaveContactSettings
  };
};
