import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SyncMetadata {
  id: string;
  property_id: string;
  sync_type: string;
  last_sync_at?: string;
  sync_status: 'pending' | 'in_progress' | 'completed' | 'error';
  total_reviews_found?: number;
  new_reviews_imported?: number;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export const useAirbnbSync = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch sync metadata for all properties
  const { data: syncMetadata = [], isLoading: isLoadingSyncData } = useQuery({
    queryKey: ['sync-metadata'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sync_metadata')
        .select('*')
        .eq('sync_type', 'airbnb_reviews')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data as SyncMetadata[];
    }
  });

  // Sync reviews for a specific property
  const syncReviews = useMutation({
    mutationFn: async (propertyId: string) => {
      console.log('🔄 Starting Airbnb review sync for property:', propertyId);
      
      const { data, error } = await supabase.functions.invoke('sync-airbnb-reviews', {
        body: { property_id: propertyId }
      });

      if (error) {
        console.error('❌ Sync function error:', error);
        throw error;
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Sync failed');
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sync-metadata'] });
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      
      toast({
        title: "Sync Completed",
        description: data.message,
      });
    },
    onError: (error) => {
      console.error('❌ Sync error:', error);
      toast({
        title: "Sync Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return {
    syncMetadata,
    isLoadingSyncData,
    syncReviews,
    isSyncing: syncReviews.isPending
  };
};