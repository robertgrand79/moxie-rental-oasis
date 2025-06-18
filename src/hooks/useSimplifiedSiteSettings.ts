
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { SettingsState } from './settings/types';
import { defaultSettings } from './settings/constants';
import { parseSettingsFromDatabase, mergeWithDefaults } from './settings/utils';

export const useSimplifiedSiteSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  // Fetch settings from database
  const fetchSettings = useCallback(async () => {
    if (!user) {
      console.log('[Settings] No user, using defaults');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      console.log('[Settings] Fetching from database...');
      
      const { data, error: fetchError } = await supabase
        .from('site_settings')
        .select('*');

      if (fetchError) {
        console.error('[Settings] Fetch error:', fetchError);
        setError(`Failed to fetch settings: ${fetchError.message}`);
        toast({
          title: 'Settings Load Error',
          description: `Could not load settings: ${fetchError.message}`,
          variant: 'destructive'
        });
        return;
      }

      const settingsMap = parseSettingsFromDatabase(data || []);
      const newSettings = mergeWithDefaults(settingsMap, defaultSettings);
      
      console.log('[Settings] Settings loaded successfully:', newSettings);
      setSettings(newSettings);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[Settings] Unexpected fetch error:', error);
      setError(errorMessage);
      toast({
        title: 'Settings Load Error',
        description: `Unexpected error: ${errorMessage}`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Save a single setting with immediate feedback
  const saveSetting = useCallback(async (key: string, value: any): Promise<boolean> => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to save settings.',
        variant: 'destructive'
      });
      return false;
    }

    setSaving(prev => ({ ...prev, [key]: true }));
    
    try {
      console.log(`[Settings] Saving ${key}:`, value);

      // Check if setting exists
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .eq('key', key)
        .maybeSingle();

      const settingData = {
        value,
        updated_at: new Date().toISOString()
      };

      let result;
      if (existing) {
        result = await supabase
          .from('site_settings')
          .update(settingData)
          .eq('key', key);
      } else {
        result = await supabase
          .from('site_settings')
          .insert({
            key,
            ...settingData,
            created_by: user.id
          });
      }

      if (result.error) {
        console.error(`[Settings] Save error for ${key}:`, result.error);
        toast({
          title: 'Save Error',
          description: `Failed to save ${key}: ${result.error.message}`,
          variant: 'destructive'
        });
        return false;
      }

      // Update local state immediately
      setSettings(prev => ({ ...prev, [key]: value }));
      console.log(`[Settings] Successfully saved ${key}`);
      
      // Force a refetch for hero background image to update cache
      if (key === 'heroBackgroundImage') {
        console.log('[Settings] Hero image updated, triggering cache refresh');
        // Small delay to allow database to settle
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('heroImageUpdated'));
        }, 500);
      }
      
      return true;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`[Settings] Unexpected save error for ${key}:`, error);
      toast({
        title: 'Save Error',
        description: `Failed to save ${key}: ${errorMessage}`,
        variant: 'destructive'
      });
      return false;
    } finally {
      setSaving(prev => ({ ...prev, [key]: false }));
    }
  }, [user]);

  // Save multiple settings
  const saveSettings = useCallback(async (updates: Partial<SettingsState>): Promise<boolean> => {
    const keys = Object.keys(updates);
    console.log('[Settings] Batch saving:', keys);

    // Set saving state for all keys
    setSaving(prev => {
      const newState = { ...prev };
      keys.forEach(key => { newState[key] = true; });
      return newState;
    });

    let successCount = 0;
    const failedKeys: string[] = [];

    for (const key of keys) {
      try {
        const success = await saveSetting(key, updates[key as keyof SettingsState]);
        if (success) {
          successCount++;
        } else {
          failedKeys.push(key);
        }
      } catch (error) {
        console.error(`[Settings] Error saving ${key}:`, error);
        failedKeys.push(key);
      }
    }

    // Clear saving state
    setSaving(prev => {
      const newState = { ...prev };
      keys.forEach(key => { newState[key] = false; });
      return newState;
    });

    const allSuccessful = failedKeys.length === 0;

    if (allSuccessful) {
      toast({
        title: 'Settings Saved',
        description: `Successfully saved ${successCount} settings.`,
      });
    } else {
      toast({
        title: 'Partial Save Error',
        description: `${successCount} saved, ${failedKeys.length} failed: ${failedKeys.join(', ')}`,
        variant: 'destructive'
      });
    }

    return allSuccessful;
  }, [saveSetting]);

  // Optimistic update
  const updateSettingOptimistic = useCallback((updates: Partial<SettingsState>) => {
    console.log('[Settings] Optimistic update:', updates);
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  // Initialize on mount
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    saving,
    error,
    saveSetting,
    saveSettings,
    updateSettingOptimistic,
    refetch: fetchSettings
  };
};
