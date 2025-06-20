
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { StaticSettings } from './types.ts';

export const fetchSettingsFromDatabase = async () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log('🔄 Fetching settings from database...');
  
  const { data, error } = await supabase
    .from('site_settings')
    .select('*');

  if (error) {
    console.error('❌ Error fetching settings:', error);
    throw new Error(`Database error: ${error.message}`);
  }

  return data;
};

export const parseSettingsData = (data: any[]): Record<string, any> => {
  return data.reduce((acc, setting) => {
    try {
      if (setting.key === 'socialMedia') {
        acc[setting.key] = typeof setting.value === 'string' 
          ? JSON.parse(setting.value) 
          : setting.value;
      } else {
        acc[setting.key] = setting.value;
      }
    } catch (parseError) {
      console.warn(`⚠️ Failed to parse setting ${setting.key}:`, parseError);
      acc[setting.key] = setting.value;
    }
    return acc;
  }, {} as Record<string, any>);
};

export const mergeWithDefaults = (settingsMap: Record<string, any>, defaultSettings: StaticSettings): StaticSettings => {
  return {
    ...defaultSettings,
    ...settingsMap,
    socialMedia: {
      ...defaultSettings.socialMedia,
      ...(settingsMap.socialMedia || {})
    }
  };
};
