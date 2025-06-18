
import { useState, useEffect } from 'react';
import { SettingsState } from './settings/types';
import { defaultSettings } from './settings/constants';
import { useSettingsFetch } from './settings/useSettingsFetch';
import { useSettingsOperations } from './settings/useSettingsOperations';

export interface SiteSetting {
  id: string;
  key: string;
  value: any;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export const useStableSiteSettings = () => {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const { fetchSettings } = useSettingsFetch(setSettings, setError, setLoading);
  const { saveSetting, saveSettings, updateSettingOptimistic } = useSettingsOperations(setSettings, setError);

  // Initialize settings
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Enhanced saveSetting that updates saving state
  const saveSettingWithState = async (key: string, value: any): Promise<boolean> => {
    setSaving(prev => ({ ...prev, [key]: true }));
    try {
      const result = await saveSetting(key, value);
      return result;
    } finally {
      setSaving(prev => ({ ...prev, [key]: false }));
    }
  };

  // Enhanced saveSettings that updates saving state for multiple keys
  const saveSettingsWithState = async (updates: Partial<SettingsState>): Promise<boolean> => {
    const keys = Object.keys(updates);
    
    // Set saving state for all keys
    setSaving(prev => {
      const newState = { ...prev };
      keys.forEach(key => {
        newState[key] = true;
      });
      return newState;
    });

    try {
      const result = await saveSettings(updates);
      return result;
    } finally {
      // Clear saving state for all keys
      setSaving(prev => {
        const newState = { ...prev };
        keys.forEach(key => {
          newState[key] = false;
        });
        return newState;
      });
    }
  };

  return {
    settings,
    loading,
    saving,
    error,
    updateSettingOptimistic,
    saveSetting: saveSettingWithState,
    saveSettings: saveSettingsWithState,
    refetch: fetchSettings
  };
};
