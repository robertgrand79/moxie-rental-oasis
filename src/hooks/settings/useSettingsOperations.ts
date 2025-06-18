
import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SettingsState } from './types';
import { serializeSettingValue } from './utils';

export const useSettingsOperations = (
  setSettings: React.Dispatch<React.SetStateAction<SettingsState>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) => {
  const { user } = useAuth();

  // Save individual setting with retry logic and better serialization
  const saveSetting = useCallback(async (key: string, value: any): Promise<boolean> => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'You must be logged in to update settings.',
        variant: 'destructive'
      });
      return false;
    }

    if (!key) {
      toast({
        title: 'Invalid Input',
        description: 'Setting key is required.',
        variant: 'destructive'
      });
      return false;
    }

    // Handle null values properly - don't convert to empty string
    if (value === undefined) {
      console.warn(`Attempted to save undefined value for key: ${key}`);
      return false;
    }

    try {
      const serializedValue = serializeSettingValue(value);

      console.log(`Saving setting ${key}:`, value, 'serialized:', serializedValue);

      // First try to update existing setting
      const { data: existingData, error: selectError } = await supabase
        .from('site_settings')
        .select('id')
        .eq('key', key)
        .maybeSingle();

      if (selectError) {
        throw selectError;
      }

      let result;
      if (existingData) {
        // Update existing setting
        result = await supabase
          .from('site_settings')
          .update({
            value: serializedValue,
            updated_at: new Date().toISOString()
          })
          .eq('key', key)
          .select();
      } else {
        // Insert new setting
        result = await supabase
          .from('site_settings')
          .insert({
            key,
            value: serializedValue,
            created_by: user.id
          })
          .select();
      }

      const { error } = result;

      if (error) {
        setError(`Failed to update ${key}: ${error.message}`);
        toast({
          title: 'Error',
          description: `Failed to update ${key}: ${error.message}`,
          variant: 'destructive'
        });
        return false;
      }

      // Update local state on success - this is key for the unsaved changes fix
      console.log(`Successfully saved setting ${key}, updating local state`);
      setSettings(prev => ({ ...prev, [key]: value }));
      setError(null);
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error(`Failed to save setting ${key}:`, error);
      toast({
        title: 'Error',
        description: `Failed to update ${key} setting: ${errorMessage}`,
        variant: 'destructive'
      });
      return false;
    }
  }, [user, setSettings, setError]);

  // Batch save multiple settings
  const saveSettings = useCallback(async (updates: Partial<SettingsState>): Promise<boolean> => {
    const keys = Object.keys(updates);
    let allSuccessful = true;
    
    console.log('Saving multiple settings:', updates);
    
    for (const key of keys) {
      const success = await saveSetting(key, updates[key as keyof SettingsState]);
      if (!success) {
        allSuccessful = false;
      }
    }

    if (allSuccessful) {
      toast({
        title: "Settings Saved",
        description: "Your settings have been successfully updated.",
      });
      
      // After successful batch save, ensure local state is fully synced
      console.log('Batch save successful, syncing local state');
      setSettings(prev => ({ ...prev, ...updates }));
    }

    return allSuccessful;
  }, [saveSetting, setSettings]);

  // Optimistic update function
  const updateSettingOptimistic = useCallback((updates: Partial<SettingsState>) => {
    console.log('Optimistic update:', updates);
    setSettings(prev => ({ ...prev, ...updates }));
  }, [setSettings]);

  return {
    saveSetting,
    saveSettings,
    updateSettingOptimistic
  };
};
