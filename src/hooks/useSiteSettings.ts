
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
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*');

      if (error) {
        console.error('Error fetching site settings:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch site settings.',
          variant: 'destructive'
        });
      } else {
        console.log('Fetched site settings:', data);
        const settingsMap = data?.reduce((acc, setting) => {
          acc[setting.key] = setting.value;
          return acc;
        }, {} as Record<string, any>) || {};
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
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to update settings.',
        variant: 'destructive'
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          key,
          value,
          created_by: user.id
        }, {
          onConflict: 'key'
        });

      if (error) {
        console.error('Error updating setting:', error);
        toast({
          title: 'Error',
          description: `Failed to update ${key} setting.`,
          variant: 'destructive'
        });
        return false;
      }

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
    return settings[key] ?? defaultValue;
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    updateSetting,
    getSetting,
    refetch: fetchSettings
  };
};
