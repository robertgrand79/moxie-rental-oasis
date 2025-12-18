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
        console.error('🌐 [PlatformConfig] Error invoking get-public-config:', {
          message: error.message,
          code: (error as any)?.code,
          details: (error as any)?.details,
          hint: (error as any)?.hint,
        });
        throw error;
      }

      const token = (data as any)?.mapboxToken as string | undefined;
      console.log(
        '🌐 [PlatformConfig] Loaded, mapboxToken:',
        token ? `${token.slice(0, 3)}… (len ${token.length})` : 'missing'
      );

      return { mapboxToken: token ?? '' };
    },
    staleTime: 30 * 60 * 1000, // Cache for 30 minutes
    retry: 2,
  });
};
