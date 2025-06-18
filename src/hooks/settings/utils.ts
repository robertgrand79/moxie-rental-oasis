
import { SettingsState } from './types';

export const parseSettingsFromDatabase = (data: any[]): Record<string, any> => {
  console.log('[Settings] Parsing settings from database:', data);
  
  return data?.reduce((acc, setting) => {
    console.log(`[Settings] Processing setting ${setting.key}:`, setting.value);
    
    try {
      // For JSONB columns, Supabase already handles JSON parsing
      // We just need to handle specific cases
      if (setting.key === 'socialMedia' || setting.key === 'emailVerificationDetails') {
        // These should already be objects from JSONB, but handle string case for backward compatibility
        acc[setting.key] = typeof setting.value === 'string' 
          ? JSON.parse(setting.value) 
          : setting.value || {};
      } else if (setting.key === 'emailSetupVerified') {
        // Handle boolean conversion - JSONB should preserve boolean type
        if (typeof setting.value === 'boolean') {
          acc[setting.key] = setting.value;
        } else {
          // Handle legacy string values
          acc[setting.key] = setting.value === 'true' || setting.value === true;
        }
      } else {
        // For other settings, use the value directly (JSONB preserves types)
        acc[setting.key] = setting.value;
      }
      
      console.log(`[Settings] Parsed ${setting.key}:`, acc[setting.key]);
    } catch (parseError) {
      console.error(`[Settings] Failed to parse setting ${setting.key}:`, parseError);
      // Fallback to raw value if parsing fails
      acc[setting.key] = setting.value;
    }
    return acc;
  }, {} as Record<string, any>) || {};
};

export const mergeWithDefaults = (settingsMap: Record<string, any>, defaultSettings: SettingsState): SettingsState => {
  console.log('[Settings] Merging with defaults:', { settingsMap, defaultSettings });
  
  const merged = {
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
  
  console.log('[Settings] Merged settings:', merged);
  return merged;
};

// Remove the old serializeSettingValue function as it's now in useSettingsOperations
// This prevents inconsistencies
