
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SyncResult {
  success: boolean;
  message?: string;
  lastUpdated?: string;
  heroImage?: string;
  syncedSettings?: string[];
  error?: string;
}

export const useStaticSettingsSync = () => {
  const [syncing, setSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  const syncToPublicSite = async (): Promise<SyncResult> => {
    setSyncing(true);
    
    try {
      console.log('🔄 Starting static settings sync...');
      
      const { data, error } = await supabase.functions.invoke('sync-static-settings', {
        body: {}
      });

      if (error) {
        console.error('❌ Sync error:', error);
        toast({
          title: 'Sync Failed',
          description: `Failed to sync settings to public site: ${error.message}`,
          variant: 'destructive'
        });
        return { success: false, error: error.message };
      }

      if (data?.success) {
        const syncTime = new Date().toISOString();
        setLastSyncTime(syncTime);
        
        console.log('✅ Sync completed successfully:', data);
        
        toast({
          title: 'Settings Synced',
          description: `Successfully synced ${data.syncedSettings?.length || 0} settings to public site`,
        });

        return {
          success: true,
          message: data.message,
          lastUpdated: data.lastUpdated,
          heroImage: data.heroImage,
          syncedSettings: data.syncedSettings
        };
      } else {
        console.error('❌ Sync failed:', data);
        toast({
          title: 'Sync Failed',
          description: data?.error || 'Unknown error occurred during sync',
          variant: 'destructive'
        });
        return { success: false, error: data?.error || 'Unknown error' };
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Unexpected sync error:', error);
      
      toast({
        title: 'Sync Error',
        description: `Unexpected error: ${errorMessage}`,
        variant: 'destructive'
      });
      
      return { success: false, error: errorMessage };
    } finally {
      setSyncing(false);
    }
  };

  return {
    syncToPublicSite,
    syncing,
    lastSyncTime
  };
};
