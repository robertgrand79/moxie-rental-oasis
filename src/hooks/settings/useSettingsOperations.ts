import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAutoSync } from '@/hooks/useAutoSync';
import { SettingsState } from './types';

export const useSettingsOperations = (
  setSettings: React.Dispatch<React.SetStateAction<SettingsState>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
) => {
  const { user } = useAuth();
  const { organization } = useCurrentOrganization();
  const { triggerAutoSync } = useAutoSync({ enabled: true, debounceMs: 1500 });

  // Improved serialization function that handles JSONB properly
  const serializeSettingValue = (value: any): any => {
    console.log('Serializing value:', value, 'type:', typeof value);
    
    // Handle null and undefined
    if (value === null || value === undefined) {
      return null;
    }
    
    // Handle boolean values - keep as boolean for JSONB
    if (typeof value === 'boolean') {
      return value;
    }
    
    // Handle primitive types (string, number) - keep as is for JSONB
    if (typeof value === 'string' || typeof value === 'number') {
      return value;
    }
    
    // Handle objects and arrays - JSONB column will handle JSON automatically
    if (typeof value === 'object') {
      return value; // Don't JSON.stringify for JSONB columns
    }
    
    return value;
  };

  // Save individual setting with improved error handling and auto-sync - scoped by organization
  const saveSetting = useCallback(async (key: string, value: any): Promise<boolean> => {
    console.log(`[Settings] Starting save for ${key}:`, value);

    if (!user) {
      const error = 'Authentication required to update settings';
      console.error('[Settings] Auth error:', error);
      toast({
        title: 'Authentication Required',
        description: error,
        variant: 'destructive'
      });
      setError(error);
      return false;
    }

    if (!organization?.id) {
      const error = 'Organization context required to save settings';
      console.error('[Settings] Organization error:', error);
      toast({
        title: 'Organization Required',
        description: error,
        variant: 'destructive'
      });
      setError(error);
      return false;
    }

    if (!key || key.trim() === '') {
      const error = 'Setting key is required';
      console.error('[Settings] Validation error:', error);
      toast({
        title: 'Validation Error',
        description: error,
        variant: 'destructive'
      });
      setError(error);
      return false;
    }

    // Handle undefined values
    if (value === undefined) {
      console.warn(`[Settings] Skipping save for ${key} - value is undefined`);
      return false;
    }

    try {
      const serializedValue = serializeSettingValue(value);
      console.log(`[Settings] Serialized value for ${key}:`, serializedValue);

      // Check if setting exists for this organization
      const { data: existingData, error: selectError } = await supabase
        .from('site_settings')
        .select('id')
        .eq('key', key)
        .eq('organization_id', organization.id)
        .maybeSingle();

      if (selectError) {
        console.error(`[Settings] Database select error for ${key}:`, selectError);
        throw new Error(`Database error: ${selectError.message}`);
      }

      let result;
      if (existingData) {
        // Update existing setting for this organization
        console.log(`[Settings] Updating existing setting ${key} for org ${organization.id}`);
        result = await supabase
          .from('site_settings')
          .update({
            value: serializedValue,
            updated_at: new Date().toISOString()
          })
          .eq('key', key)
          .eq('organization_id', organization.id)
          .select();
      } else {
        // Insert new setting for this organization
        console.log(`[Settings] Creating new setting ${key} for org ${organization.id}`);
        result = await supabase
          .from('site_settings')
          .insert({
            key,
            value: serializedValue,
            created_by: user.id,
            organization_id: organization.id
          })
          .select();
      }

      const { error: upsertError } = result;

      if (upsertError) {
        console.error(`[Settings] Database upsert error for ${key}:`, upsertError);
        const errorMessage = `Failed to save ${key}: ${upsertError.message}`;
        setError(errorMessage);
        toast({
          title: 'Database Error',
          description: errorMessage,
          variant: 'destructive'
        });
        return false;
      }

      // Update local state immediately after successful save
      console.log(`[Settings] Successfully saved ${key}, updating local state`);
      setSettings(prev => {
        const newState = { ...prev, [key]: value };
        console.log(`[Settings] Local state updated for ${key}`, newState);
        return newState;
      });
      
      setError(null);
      
      // Trigger auto-sync for public-facing content
      const publicContentKeys = [
        'siteName', 'tagline', 'description', 'heroTitle', 'heroSubtitle', 
        'heroDescription', 'heroBackgroundImage', 'heroLocationText', 
        'heroCTAText', 'contactEmail', 'phone', 'address', 'socialMedia'
      ];
      
      if (publicContentKeys.includes(key)) {
        console.log(`[Settings] Triggering auto-sync for public content: ${key}`);
        triggerAutoSync(`settings change: ${key}`);
      }
      
      console.log(`[Settings] Save operation completed successfully for ${key}`);
      return true;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error(`[Settings] Unexpected error saving ${key}:`, error);
      setError(errorMessage);
      toast({
        title: 'Save Error',
        description: `Failed to save ${key}: ${errorMessage}`,
        variant: 'destructive'
      });
      return false;
    }
  }, [user, organization?.id, setSettings, setError, triggerAutoSync]);

  // Batch save multiple settings with better error tracking and auto-sync
  const saveSettings = useCallback(async (updates: Partial<SettingsState>): Promise<boolean> => {
    const keys = Object.keys(updates);
    console.log('[Settings] Starting batch save for keys:', keys);
    
    let successCount = 0;
    let failedKeys: string[] = [];
    
    for (const key of keys) {
      try {
        const success = await saveSetting(key, updates[key as keyof SettingsState]);
        if (success) {
          successCount++;
        } else {
          failedKeys.push(key);
        }
      } catch (error) {
        console.error(`[Settings] Error in batch save for ${key}:`, error);
        failedKeys.push(key);
      }
    }

    const allSuccessful = failedKeys.length === 0;
    
    if (allSuccessful) {
      console.log('[Settings] Batch save completed successfully');
      toast({
        title: "Settings Saved",
        description: `Successfully updated ${successCount} settings.`,
      });
      
      // Ensure local state is fully synced after batch save
      setSettings(prev => ({ ...prev, ...updates }));
      
      // Trigger auto-sync after batch save (debounced)
      console.log('[Settings] Triggering auto-sync after batch save');
      triggerAutoSync('batch settings save');
    } else {
      console.error('[Settings] Batch save partially failed:', failedKeys);
      toast({
        title: "Partial Save Error",
        description: `${successCount} settings saved, ${failedKeys.length} failed: ${failedKeys.join(', ')}`,
        variant: 'destructive'
      });
    }

    return allSuccessful;
  }, [saveSetting, setSettings, triggerAutoSync]);

  // Optimistic update function with logging
  const updateSettingOptimistic = useCallback((updates: Partial<SettingsState>) => {
    console.log('[Settings] Optimistic update:', updates);
    setSettings(prev => {
      const newState = { ...prev, ...updates };
      console.log('[Settings] New optimistic state:', newState);
      return newState;
    });
  }, [setSettings]);

  return {
    saveSetting,
    saveSettings,
    updateSettingOptimistic
  };
};
