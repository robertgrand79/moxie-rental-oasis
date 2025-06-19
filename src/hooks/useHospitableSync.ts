
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface HospitableSyncStats {
  totalBookings: number;
  newSubscribers: number;
  updatedSubscribers: number;
  skippedContacts: number;
  errors?: number;
}

interface HospitableSyncResult {
  success: boolean;
  message: string;
  stats?: HospitableSyncStats;
  error?: string;
  troubleshooting?: {
    commonIssues: string[];
    nextSteps: string[];
  };
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
        const { stats } = result;
        let description = `Added ${stats.newSubscribers} new contacts, updated ${stats.updatedSubscribers} existing contacts from ${stats.totalBookings} bookings.`;
        
        if (stats.errors && stats.errors > 0) {
          description += ` ${stats.errors} contacts had errors during processing.`;
        }

        toast({
          title: "Hospitable Sync Completed! 🎉",
          description,
          variant: stats.errors && stats.errors > 0 ? "default" : "default",
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

      // Provide specific error messages based on common issues
      let errorTitle = "Sync Failed";
      let errorDescription = err.message || "Failed to sync Hospitable contacts.";

      if (err.message?.includes('API key')) {
        errorTitle = "API Key Issue";
        errorDescription = err.message + " Please check your Hospitable API key in the Supabase dashboard.";
      } else if (err.message?.includes('Authentication failed')) {
        errorTitle = "Authentication Failed";
        errorDescription = "Your Hospitable API key may have expired. Please generate a new one.";
      } else if (err.message?.includes('Rate limit')) {
        errorTitle = "Rate Limited";
        errorDescription = "Too many requests. Please wait a few minutes before trying again.";
      } else if (err.message?.includes('permission')) {
        errorTitle = "Permission Denied";
        errorDescription = "Your API key doesn't have the required permissions. Please check your Hospitable account settings.";
      }

      toast({
        title: errorTitle,
        description: errorDescription,
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
