import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { supabase } from '@/integrations/supabase/client';
import { SettingsState } from './types';
import { defaultSettings } from './constants';
import { parseSettingsFromDatabase, mergeWithDefaults } from './utils';
import { debug } from '@/utils/debug';

export const useSettingsFetch = (
  setSettings: React.Dispatch<React.SetStateAction<SettingsState>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const { user } = useAuth();
  const { organization } = useCurrentOrganization();

  // Memoized function to fetch settings from database - filtered by organization
  const fetchSettings = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    if (!organization?.id) {
      debug.settings('No organization, using defaults');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      debug.settings('Fetching settings from database for organization:', organization.id);
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('organization_id', organization.id);

      if (error) {
        debug.error('Error fetching site settings:', error);
        setError(`Failed to fetch site settings: ${error.message}`);
        return;
      }

      // Convert array of settings to our structured format
      const settingsMap = parseSettingsFromDatabase(data);

      debug.settings('Fetched settings from database:', settingsMap);

      // Merge with defaults to ensure all properties exist
      const newSettings = mergeWithDefaults(settingsMap, defaultSettings);

      debug.settings('Final merged settings:', newSettings);
      setSettings(newSettings);
    } catch (error) {
      debug.error('Error in fetchSettings:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user, organization?.id, setSettings, setError, setLoading]);

  return {
    fetchSettings
  };
};
