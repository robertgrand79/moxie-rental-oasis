
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { SettingsState } from './settings/types';
import { defaultSettings } from './settings/constants';
import { parseSettingsFromDatabase, mergeWithDefaults } from './settings/utils';
import { debug } from '@/utils/debug';
import { RealtimeChannel } from '@supabase/supabase-js';

export const useSimplifiedSiteSettings = () => {
  const { user } = useAuth();
  const { organization } = useCurrentOrganization();
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Fetch settings from database - filtered by organization
  const fetchSettings = useCallback(async () => {
    if (!user) {
      debug.settings('No user, using defaults');
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
      debug.settings('========== FETCH START ==========');
      debug.settings('Organization ID:', organization.id);
      debug.settings('Organization Name:', organization.name);
      
      const { data, error: fetchError } = await supabase
        .from('site_settings')
        .select('*')
        .eq('organization_id', organization.id);

      if (fetchError) {
        debug.error('[Settings] Fetch error:', fetchError);
        setError(`Failed to fetch settings: ${fetchError.message}`);
        toast({
          title: 'Settings Load Error',
          description: `Could not load settings: ${fetchError.message}`,
          variant: 'destructive'
        });
        return;
      }

      debug.settings('Raw rows from DB:', data?.length || 0);
      debug.settings('Sample keys:', data?.slice(0, 5).map(r => r.key));

      const settingsMap = parseSettingsFromDatabase(data || []);
      debug.settings('Parsed settings map keys:', Object.keys(settingsMap));
      
      const newSettings = mergeWithDefaults(settingsMap, defaultSettings);
      
      debug.settings('Final merged settings:');
      debug.settings('  siteName:', newSettings.siteName);
      debug.settings('  tagline:', newSettings.tagline);
      debug.settings('  heroTitle:', newSettings.heroTitle);
      debug.settings('  contactEmail:', newSettings.contactEmail);
      debug.settings('========== FETCH END ==========');
      
      setSettings(newSettings);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      debug.error('[Settings] Unexpected fetch error:', error);
      setError(errorMessage);
      toast({
        title: 'Settings Load Error',
        description: `Unexpected error: ${errorMessage}`,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [user, organization?.id]);

  // Save a single setting with immediate feedback - scoped by organization
  const saveSetting = useCallback(async (key: string, value: any): Promise<boolean> => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to save settings.',
        variant: 'destructive'
      });
      return false;
    }

    if (!organization?.id) {
      toast({
        title: 'Organization Required',
        description: 'Organization context required to save settings.',
        variant: 'destructive'
      });
      return false;
    }

    setSaving(prev => ({ ...prev, [key]: true }));
    
    try {
      debug.settings('========== SAVE START ==========');
      debug.settings('Key:', key);
      debug.settings('Value:', value);
      debug.settings('Organization ID:', organization.id);

      // Check if setting exists for this organization
      const { data: existing, error: checkError } = await supabase
        .from('site_settings')
        .select('id, key, value')
        .eq('key', key)
        .eq('organization_id', organization.id)
        .maybeSingle();

      if (checkError) {
        debug.error('[Settings] Error checking existing:', checkError);
      }
      
      debug.settings('Existing row:', existing ? `ID: ${existing.id}` : 'None (will insert)');

      const settingData = {
        value,
        updated_at: new Date().toISOString()
      };

      let result;
      if (existing) {
        debug.settings('Updating existing row...');
        result = await supabase
          .from('site_settings')
          .update(settingData)
          .eq('key', key)
          .eq('organization_id', organization.id)
          .select();
      } else {
        debug.settings('Inserting new row...');
        result = await supabase
          .from('site_settings')
          .insert({
            key,
            ...settingData,
            created_by: user.id,
            organization_id: organization.id
          })
          .select();
      }

      if (result.error) {
        debug.error('[Settings] Save error for', key, ':', result.error);
        toast({
          title: 'Save Error',
          description: `Failed to save ${key}: ${result.error.message}`,
          variant: 'destructive'
        });
        return false;
      }

      debug.settings('Saved successfully:', result.data);

      // Update local state immediately
      setSettings(prev => ({ ...prev, [key]: value }));
      debug.settings('Local state updated');
      debug.settings('========== SAVE END ==========');
      
      // Force a refetch for hero background image to update cache
      if (key === 'heroBackgroundImage') {
        debug.settings('Hero image updated, triggering cache refresh');
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('heroImageUpdated'));
        }, 500);
      }
      
      return true;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      debug.error(`[Settings] Unexpected save error for ${key}:`, error);
      toast({
        title: 'Save Error',
        description: `Failed to save ${key}: ${errorMessage}`,
        variant: 'destructive'
      });
      return false;
    } finally {
      setSaving(prev => ({ ...prev, [key]: false }));
    }
  }, [user, organization?.id]);

  // Save multiple settings
  const saveSettings = useCallback(async (updates: Partial<SettingsState>): Promise<boolean> => {
    const keys = Object.keys(updates);
    debug.settings('Batch saving:', keys);

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
        debug.error(`[Settings] Error saving ${key}:`, error);
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
    debug.settings('Optimistic update:', updates);
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  // Initialize on mount and set up realtime subscription
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Realtime subscription for live updates across users
  useEffect(() => {
    const orgId = organization?.id;
    if (!orgId) return;

    // Clean up any previous channel first (prevents "subscribe multiple times" race)
    if (channelRef.current) {
      try {
        supabase.removeChannel(channelRef.current);
      } catch {
        // ignore
      }
      channelRef.current = null;
    }

    // Create unique channel name to avoid conflicts
    const channelName = `admin_site_settings_${orgId}_${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_settings',
          filter: `organization_id=eq.${orgId}`
        },
        (payload) => {
          debug.settings('Realtime update received:', payload.eventType);
          // Refetch all settings to ensure consistency
          fetchSettings();
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        try {
          supabase.removeChannel(channelRef.current);
        } catch {
          // ignore
        }
        channelRef.current = null;
      }
    };
  }, [organization?.id]); // Only depend on org ID, not fetchSettings

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
