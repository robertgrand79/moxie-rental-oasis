
import { useState, useCallback } from 'react';
import { useStaticSettingsSync } from './useStaticSettingsSync';
import { toast } from './use-toast';
import { debug } from '@/utils/debug';

interface AutoSyncOptions {
  enabled?: boolean;
  debounceMs?: number;
  showToasts?: boolean;
}

export const useAutoSync = (options: AutoSyncOptions = {}) => {
  const { enabled = true, debounceMs = 2000, showToasts = false } = options;
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const { syncToPublicSite } = useStaticSettingsSync();

  // Debounced sync function
  const debouncedSync = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      
      return async (reason?: string) => {
        if (!enabled) return;
        
        clearTimeout(timeoutId);
        
        timeoutId = setTimeout(async () => {
          setIsSyncing(true);
          
          try {
            debug.sync('Auto-sync triggered:', reason || 'content change');
            const result = await syncToPublicSite();
            
            if (result.success) {
              setLastSyncTime(new Date().toISOString());
              
              if (showToasts) {
                toast({
                  title: 'Auto-sync Complete',
                  description: 'Changes published to public site',
                });
              }
              
              debug.sync('Auto-sync completed successfully');
            } else {
              debug.error('Auto-sync failed:', result.error);
              
              if (showToasts) {
                toast({
                  title: 'Auto-sync Failed',
                  description: 'Please use manual sync if needed',
                  variant: 'destructive'
                });
              }
            }
          } catch (error) {
            debug.error('Auto-sync error:', error);
          } finally {
            setIsSyncing(false);
          }
        }, debounceMs);
      };
    })(),
    [enabled, debounceMs, showToasts, syncToPublicSite]
  );

  return {
    triggerAutoSync: debouncedSync,
    isSyncing,
    lastSyncTime,
    enabled
  };
};
