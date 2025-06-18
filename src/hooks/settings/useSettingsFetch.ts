
import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { SettingsState } from './types';
import { defaultSettings } from './constants';
import { parseSettingsFromDatabase, mergeWithDefaults } from './utils';

export const useSettingsFetch = (
  setSettings: React.Dispatch<React.SetStateAction<SettingsState>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const { user } = useAuth();

  // Memoized function to fetch settings from database
  const fetchSettings = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      console.log('Fetching settings from database...');
      const { data, error } = await supabase
        .from('site_settings')
        .select('*');

      if (error) {
        console.error('Error fetching site settings:', error);
        setError(`Failed to fetch site settings: ${error.message}`);
        return;
      }

      // Convert array of settings to our structured format
      const settingsMap = parseSettingsFromDatabase(data);

      console.log('Fetched settings from database:', settingsMap);

      // Merge with defaults to ensure all properties exist
      const newSettings = mergeWithDefaults(settingsMap, defaultSettings);

      console.log('Final merged settings:', newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error('Error in fetchSettings:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, setSettings, setError, setLoading]);

  return {
    fetchSettings
  };
};
