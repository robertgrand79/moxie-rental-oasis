
import { useState, useEffect } from 'react';
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

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*');

      if (error) {
        console.error('Error fetching site settings:', error);
        setError(`Failed to fetch site settings: ${error.message}`);
        toast({
          title: 'Error',
          description: `Failed to fetch site settings: ${error.message}`,
          variant: 'destructive'
        });
      } else {
        const settingsMap = data?.reduce((acc, setting) => {
          acc[setting.key] = setting.value;
          return acc;
        }, {} as Record<string, any>) || {};
        setSettings(settingsMap);
      }
    } catch (error) {
      console.error('Error in fetchSettings:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: 'Failed to fetch site settings.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createDefaultSettingsIfMissing = async () => {
    if (!user) return;
    
    const defaultSettings = [
      { key: 'siteName', value: 'Moxie Vacation Rentals' },
      { key: 'tagline', value: 'Your perfect getaway is just a click away.' },
      { key: 'description', value: 'Discover amazing vacation rental properties in prime locations.' },
      { key: 'heroTitle', value: 'Your Home Away From Home' },
      { key: 'heroSubtitle', value: 'in Eugene' },
      { key: 'heroDescription', value: 'Discover premium vacation rentals in the heart of Oregon\'s most beautiful city.' },
      { key: 'heroBackgroundImage', value: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=2850&q=80' },
      { key: 'heroLocationText', value: 'Eugene, Oregon' },
      { key: 'heroRating', value: '4.9' },
      { key: 'heroCTAText', value: 'View Properties' },
      { key: 'contactEmail', value: 'contact@moxievacationrentals.com' },
      { key: 'phone', value: '+1 (555) 123-4567' },
      { key: 'address', value: '123 Vacation St, Resort City, RC 12345' },
      { key: 'socialMedia', value: { facebook: '', instagram: '', twitter: '', googlePlaces: '' } }
    ];

    for (const defaultSetting of defaultSettings) {
      if (!settings[defaultSetting.key]) {
        await updateSetting(defaultSetting.key, defaultSetting.value);
      }
    }
  };

  const updateSetting = async (key: string, value: any): Promise<boolean> => {
    if (!user) {
      setError('You must be logged in to update settings');
      toast({
        title: 'Authentication Required',
        description: 'You must be logged in to update settings.',
        variant: 'destructive'
      });
      return false;
    }

    if (!key || value === undefined || value === null) {
      toast({
        title: 'Invalid Input',
        description: 'Setting key and value are required.',
        variant: 'destructive'
      });
      return false;
    }

    try {
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
            value,
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
            value,
            created_by: user.id
          })
          .select();
      }

      const { data, error } = result;

      if (error) {
        setError(`Failed to update ${key}: ${error.message}`);
        toast({
          title: 'Error',
          description: `Failed to update ${key}: ${error.message}`,
          variant: 'destructive'
        });
        return false;
      }

      // Update local state immediately
      setSettings(prev => ({ ...prev, [key]: value }));
      
      // Force a refetch to ensure consistency
      setTimeout(() => {
        fetchSettings();
      }, 100);
      
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: `Failed to update ${key} setting: ${errorMessage}`,
        variant: 'destructive'
      });
      return false;
    }
  };

  const getSetting = (key: string, defaultValue?: any) => {
    return settings[key] ?? defaultValue;
  };

  useEffect(() => {
    if (user) {
      fetchSettings().then(() => {
        // After fetching, create any missing default settings
        createDefaultSettingsIfMissing();
      });
    } else {
      setLoading(false);
    }
  }, [user]);

  return {
    settings,
    loading,
    error,
    updateSetting,
    getSetting,
    refetch: fetchSettings
  };
};
