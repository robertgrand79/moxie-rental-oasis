
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
  const { user } = useAuth();

  const fetchSettings = async () => {
    console.log('Fetching site settings...');
    console.log('Current user:', user?.id, user?.email);
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*');

      if (error) {
        console.error('Error fetching site settings:', error);
        toast({
          title: 'Error',
          description: `Failed to fetch site settings: ${error.message}`,
          variant: 'destructive'
        });
      } else {
        console.log('Fetched site settings:', data);
        const settingsMap = data?.reduce((acc, setting) => {
          acc[setting.key] = setting.value;
          return acc;
        }, {} as Record<string, any>) || {};
        console.log('Settings map:', settingsMap);
        setSettings(settingsMap);
      }
    } catch (error) {
      console.error('Error in fetchSettings:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch site settings.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: any): Promise<boolean> => {
    console.log('Updating setting:', key, 'with value:', value);
    console.log('Current user for update:', user?.id);
    
    if (!user) {
      console.error('No user found for updating settings');
      toast({
        title: 'Error',
        description: 'You must be logged in to update settings.',
        variant: 'destructive'
      });
      return false;
    }

    try {
      console.log('Attempting to upsert setting...');
      const { data, error } = await supabase
        .from('site_settings')
        .upsert({
          key,
          value,
          created_by: user.id
        }, {
          onConflict: 'key'
        })
        .select();

      console.log('Upsert response:', { data, error });

      if (error) {
        console.error('Error updating setting:', error);
        toast({
          title: 'Error',
          description: `Failed to update ${key}: ${error.message}`,
          variant: 'destructive'
        });
        return false;
      }

      console.log('Successfully updated setting:', data);
      setSettings(prev => ({ ...prev, [key]: value }));
      toast({
        title: 'Success',
        description: `${key} setting updated successfully!`
      });
      
      return true;
    } catch (error) {
      console.error('Error in updateSetting:', error);
      toast({
        title: 'Error',
        description: `Failed to update ${key} setting.`,
        variant: 'destructive'
      });
      return false;
    }
  };

  const getSetting = (key: string, defaultValue?: any) => {
    const value = settings[key] ?? defaultValue;
    console.log(`Getting setting ${key}:`, value);
    return value;
  };

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  return {
    settings,
    loading,
    updateSetting,
    getSetting,
    refetch: fetchSettings
  };
};
