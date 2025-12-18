import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PlatformConfig {
  mapboxToken: string;
}

/**
 * Hook to fetch platform-level public configuration.
 * This includes settings like Mapbox token that are shared across all tenants.
 */
export const usePlatformConfig = () => {
  return useQuery({
    queryKey: ['platform-config'],
    queryFn: async (): Promise<PlatformConfig> => {
      console.log('🌐 [PlatformConfig] Fetching platform config...');
      
      const { data, error } = await supabase.functions.invoke('get-public-config');

      if (error) {
        console.error('🌐 [PlatformConfig] Error:', error.message);
        throw error;
      }

      console.log('🌐 [PlatformConfig] Loaded, mapboxToken present:', !!data?.mapboxToken);
      return data as PlatformConfig;
    },
    staleTime: 30 * 60 * 1000, // Cache for 30 minutes
    retry: 2,
  });
};
