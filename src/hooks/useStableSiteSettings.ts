
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface SiteSetting {
  id: string;
  key: string;
  value: any;
  created_at: string;
  updated_at: string;
  created_by: string;
}

interface SettingsState {
  // Basic site information
  siteName: string;
  tagline: string;
  description: string;
  
  // Hero section with image support
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  heroBackgroundImage: string;
  heroLocationText: string;
  heroRating: string;
  heroCTAText: string;
  
  // Contact information
  contactEmail: string;
  phone: string;
  address: string;
  socialMedia: {
    facebook: string;
    instagram: string;
    twitter: string;
    googlePlaces: string;
  };
  
  // Email settings
  emailFromAddress: string;
  emailFromName: string;
  emailReplyTo: string;
  
  // SEO settings
  siteTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  favicon: string;
  
  // Analytics
  googleAnalyticsId: string;
  googleTagManagerId: string;
  facebookPixelId: string;
  customHeaderScripts: string;
  customFooterScripts: string;
  customCss: string;
  
  // Maps
  mapboxToken: string;
}

const defaultSettings: SettingsState = {
  siteName: 'Moxie Vacation Rentals',
  tagline: 'Your perfect getaway is just a click away.',
  description: 'Discover amazing vacation rental properties in prime locations.',
  heroTitle: 'Your Home Away From Home',
  heroSubtitle: 'in Eugene',
  heroDescription: 'Discover premium vacation rentals in the heart of Oregon\'s most beautiful city.',
  heroBackgroundImage: '',
  heroLocationText: 'Eugene, Oregon',
  heroRating: '4.9',
  heroCTAText: 'View Properties',
  contactEmail: 'contact@moxievacationrentals.com',
  phone: '+1 (555) 123-4567',
  address: '123 Vacation St, Resort City, RC 12345',
  socialMedia: {
    facebook: '',
    instagram: '',
    twitter: '',
    googlePlaces: ''
  },
  emailFromAddress: 'noreply@moxievacationrentals.com',
  emailFromName: 'Moxie Vacation Rentals',
  emailReplyTo: 'contact@moxievacationrentals.com',
  siteTitle: 'Moxie Vacation Rentals',
  metaDescription: 'Your Home Base for Living Like a Local in Eugene - Discover Eugene, Oregon through thoughtfully curated vacation rentals.',
  ogTitle: '',
  ogDescription: '',
  ogImage: '',
  favicon: '',
  googleAnalyticsId: '',
  googleTagManagerId: '',
  facebookPixelId: '',
  customHeaderScripts: '',
  customFooterScripts: '',
  customCss: '',
  mapboxToken: ''
};

export const useStableSiteSettings = () => {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
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
      const settingsMap = data?.reduce((acc, setting) => {
        // Handle JSON parsing for complex objects
        try {
          if (setting.key === 'socialMedia') {
            acc[setting.key] = typeof setting.value === 'string' 
              ? JSON.parse(setting.value) 
              : setting.value;
          } else {
            acc[setting.key] = setting.value;
          }
        } catch (parseError) {
          console.warn(`Failed to parse setting ${setting.key}:`, parseError);
          acc[setting.key] = setting.value;
        }
        return acc;
      }, {} as Record<string, any>) || {};

      console.log('Fetched settings from database:', settingsMap);

      // Merge with defaults to ensure all properties exist
      const newSettings = {
        ...defaultSettings,
        ...settingsMap,
        socialMedia: {
          ...defaultSettings.socialMedia,
          ...(settingsMap.socialMedia || {})
        }
      };

      console.log('Final merged settings:', newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error('Error in fetchSettings:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Optimistic update function
  const updateSettingOptimistic = useCallback((updates: Partial<SettingsState>) => {
    console.log('Optimistic update:', updates);
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

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

    setSaving(prev => ({ ...prev, [key]: true }));

    try {
      // Serialize complex objects to JSON, but handle null values properly
      let serializedValue = value;
      if (value !== null && typeof value === 'object') {
        serializedValue = JSON.stringify(value);
      }

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
    } finally {
      setSaving(prev => ({ ...prev, [key]: false }));
    }
  }, [user]);

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
        description: "Your hero section settings have been successfully updated.",
      });
      
      // After successful batch save, ensure local state is fully synced
      console.log('Batch save successful, syncing local state');
      setSettings(prev => ({ ...prev, ...updates }));
    }

    return allSuccessful;
  }, [saveSetting]);

  // Initialize settings
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    saving,
    error,
    updateSettingOptimistic,
    saveSetting,
    saveSettings,
    refetch: fetchSettings
  };
};
