
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface HospitableSyncStats {
  totalBookings: number;
  newSubscribers: number;
  updatedSubscribers: number;
  skippedContacts: number;
}

interface HospitableSyncResult {
  success: boolean;
  message: string;
  stats?: HospitableSyncStats;
  error?: string;
}

export const useHospitableSync = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<HospitableSyncResult | null>(null);
  const { toast } = useToast();

  const syncHospitableContacts = async (): Promise<HospitableSyncResult> => {
    try {
      setIsLoading(true);
      console.log('🏨 Starting Hospitable contact sync...');

      const { data, error } = await supabase.functions.invoke('hospitable-sync');

      if (error) {
        console.error('❌ Hospitable sync error:', error);
        throw error;
      }

      const result: HospitableSyncResult = data;
      setLastSyncResult(result);

      if (result.success && result.stats) {
        toast({
          title: "Hospitable Sync Completed! 🎉",
          description: `Added ${result.stats.newSubscribers} new contacts, updated ${result.stats.updatedSubscribers} existing contacts from ${result.stats.totalBookings} bookings.`,
        });
      } else {
        throw new Error(result.error || 'Unknown sync error');
      }

      return result;
    } catch (err: any) {
      console.error('❌ Hospitable sync failed:', err);
      
      const errorResult: HospitableSyncResult = {
        success: false,
        message: 'Sync failed',
        error: err.message || 'Unknown error occurred'
      };

      setLastSyncResult(errorResult);

      toast({
        title: "Sync Failed",
        description: err.message || "Failed to sync Hospitable contacts. Please check your API key and try again.",
        variant: "destructive",
      });

      return errorResult;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    syncHospitableContacts,
    isLoading,
    lastSyncResult,
  };
};
