
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Property } from '@/types/property';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';

export const usePropertyFetch = () => {
  const queryClient = useQueryClient();
  const { organization, loading: orgLoading } = useCurrentOrganization();
  const queryKey = ['admin-properties', organization?.id];

  const query = useQuery({
    queryKey,
    queryFn: async (): Promise<Property[]> => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('organization_id', organization!.id)
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ usePropertyFetch - Supabase error:', error);
        toast({
          title: 'Error',
          description: `Failed to fetch properties: ${error.message}`,
          variant: 'destructive'
        });
        throw error;
      }

      return Array.isArray(data) ? data : [];
    },
    enabled: !!organization?.id && !orgLoading,
    staleTime: 2 * 60 * 1000, // 2 minutes cache validity
  });

  const setProperties = (updater: Property[] | ((prev: Property[]) => Property[])) => {
    queryClient.setQueryData(queryKey, (prev: Property[] | undefined) => {
      const safePrev = prev || [];
      if (typeof updater === 'function') {
        return updater(safePrev);
      }
      return updater;
    });
  };

  return {
    properties: query.data ?? [],
    setProperties,
    loading: query.isLoading || orgLoading,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch
  };
};
