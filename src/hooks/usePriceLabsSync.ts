import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { invalidateAllPricingQueries } from '@/utils/pricingCacheUtils';
import { useSystemNotifications } from '@/hooks/useSystemNotifications';

interface SyncPriceLabsParams {
  property_id?: string;
  start_date?: string;
  end_date?: string;
}

interface SyncResult {
  property_id: string;
  property_title: string;
  success: boolean;
  prices_synced?: number;
  error?: string;
  message?: string;
}

interface SyncResponse {
  success: boolean;
  message: string;
  total_prices_updated: number;
  results: SyncResult[];
}

export const usePriceLabsSync = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { createApiErrorAlert } = useSystemNotifications();

  const syncMutation = useMutation({
    mutationFn: async (params: SyncPriceLabsParams = {}) => {
      toast({
        title: 'Syncing Pricing',
        description: 'Fetching latest prices from PriceLabs...',
      });

      const { data, error } = await supabase.functions.invoke('sync-pricelabs-pricing', {
        body: params,
      });

      if (error) throw error;
      return data as SyncResponse;
    },
    onSuccess: (data) => {
      // Invalidate all pricing queries to refetch updated data across all views
      invalidateAllPricingQueries(queryClient);

      const failedSyncs = data.results.filter(r => !r.success);
      
      if (failedSyncs.length === 0) {
        toast({
          title: 'Pricing Synced Successfully',
          description: `Updated ${data.total_prices_updated} prices across ${data.results.length} properties`,
        });
      } else {
        toast({
          title: 'Partial Sync Complete',
          description: `Synced ${data.results.length - failedSyncs.length} properties. ${failedSyncs.length} failed.`,
          variant: 'destructive',
        });
      }
    },
    onError: (error: Error) => {
      console.error('PriceLabs sync error:', error);
      
      // Track error count for recurring errors
      const errorCountKey = 'pricelabs_error_count';
      const currentCount = parseInt(localStorage.getItem(errorCountKey) || '0') + 1;
      localStorage.setItem(errorCountKey, currentCount.toString());
      
      // Create API error notification
      createApiErrorAlert({
        serviceName: 'PriceLabs',
        errorMessage: error.message || 'Failed to sync pricing',
        errorCount: currentCount,
        lastOccurred: new Date().toISOString(),
      });
      
      toast({
        title: 'Sync Failed',
        description: error.message || 'Failed to sync pricing from PriceLabs',
        variant: 'destructive',
      });
    },
  });

  return {
    syncPricing: syncMutation.mutate,
    isSyncing: syncMutation.isPending,
    syncResult: syncMutation.data,
  };
};
