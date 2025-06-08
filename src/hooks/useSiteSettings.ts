
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
    console.log('🔍 Fetching site settings...');
    console.log('👤 Current user:', user?.id, user?.email);
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*');

      if (error) {
        console.error('❌ Error fetching site settings:', error);
        setError(`Failed to fetch site settings: ${error.message}`);
        toast({
          title: 'Error',
          description: `Failed to fetch site settings: ${error.message}`,
          variant: 'destructive'
        });
      } else {
        console.log('✅ Fetched site settings:', data);
        const settingsMap = data?.reduce((acc, setting) => {
          acc[setting.key] = setting.value;
          return acc;
        }, {} as Record<string, any>) || {};
        console.log('📊 Settings map:', settingsMap);
        setSettings(settingsMap);
      }
    } catch (error) {
      console.error('💥 Error in fetchSettings:', error);
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

  const updateSetting = async (key: string, value: any): Promise<boolean> => {
    console.log('💾 Updating setting:', key, 'with value:', value);
    console.log('👤 Current user for update:', user?.id);
    
    if (!user) {
      console.error('❌ No user found for updating settings');
      setError('You must be logged in to update settings');
      toast({
        title: 'Authentication Required',
        description: 'You must be logged in to update settings.',
        variant: 'destructive'
      });
      return false;
    }

    if (!key || value === undefined || value === null) {
      console.error('❌ Invalid key or value provided:', { key, value });
      toast({
        title: 'Invalid Input',
        description: 'Setting key and value are required.',
        variant: 'destructive'
      });
      return false;
    }

    try {
      console.log('🔄 Attempting to upsert setting...');
      
      // First try to update existing setting
      const { data: existingData, error: selectError } = await supabase
        .from('site_settings')
        .select('id')
        .eq('key', key)
        .maybeSingle();

      if (selectError) {
        console.error('❌ Error checking existing setting:', selectError);
        throw selectError;
      }

      let result;
      if (existingData) {
        // Update existing setting
        console.log('🔄 Updating existing setting with ID:', existingData.id);
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
        console.log('➕ Creating new setting');
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
      console.log('📝 Upsert response:', { data, error });

      if (error) {
        console.error('❌ Error updating setting:', error);
        setError(`Failed to update ${key}: ${error.message}`);
        toast({
          title: 'Error',
          description: `Failed to update ${key}: ${error.message}`,
          variant: 'destructive'
        });
        return false;
      }

      console.log('✅ Successfully updated setting:', data);
      // Update local state immediately
      setSettings(prev => ({ ...prev, [key]: value }));
      
      toast({
        title: 'Success',
        description: `${key} setting updated successfully!`
      });
      
      return true;
    } catch (error) {
      console.error('💥 Error in updateSetting:', error);
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
    const value = settings[key] ?? defaultValue;
    console.log(`🔍 Getting setting ${key}:`, value);
    return value;
  };

  useEffect(() => {
    console.log('🚀 useSiteSettings useEffect triggered, user:', user?.id);
    if (user) {
      fetchSettings();
    } else {
      console.log('⏳ No user yet, waiting...');
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
