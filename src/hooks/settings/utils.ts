
import { SettingsState } from './types';

export const parseSettingsFromDatabase = (data: any[]): Record<string, any> => {
  return data?.reduce((acc, setting) => {
    // Handle JSON parsing for complex objects
    try {
      if (setting.key === 'socialMedia' || setting.key === 'emailVerificationDetails') {
        acc[setting.key] = typeof setting.value === 'string' 
          ? JSON.parse(setting.value) 
          : setting.value;
      } else if (setting.key === 'emailSetupVerified') {
        // Handle boolean conversion for emailSetupVerified
        acc[setting.key] = setting.value === 'true' || setting.value === true;
      } else {
        acc[setting.key] = setting.value;
      }
    } catch (parseError) {
      console.warn(`Failed to parse setting ${setting.key}:`, parseError);
      acc[setting.key] = setting.value;
    }
    return acc;
  }, {} as Record<string, any>) || {};
};

export const mergeWithDefaults = (settingsMap: Record<string, any>, defaultSettings: SettingsState): SettingsState => {
  return {
    ...defaultSettings,
    ...settingsMap,
    socialMedia: {
      ...defaultSettings.socialMedia,
      ...(settingsMap.socialMedia || {})
    },
    emailVerificationDetails: {
      ...defaultSettings.emailVerificationDetails,
      ...(settingsMap.emailVerificationDetails || {})
    }
  };
};

export const serializeSettingValue = (value: any): any => {
  // Handle null values properly - don't convert to empty string
  if (value === undefined) {
    return null;
  }
  
  // Serialize complex objects to JSON, but handle null values properly
  if (value !== null && typeof value === 'object') {
    return JSON.stringify(value);
  }
  
  return value;
};
