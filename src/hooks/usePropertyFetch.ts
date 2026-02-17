import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Property } from '@/types/property';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';

export const usePropertyFetch = () => {
  const { organization, loading: orgLoading } = useCurrentOrganization();
  const organizationId = organization?.id;
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['properties', organizationId],
    queryFn: async (): Promise<Property[]> => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('organization_id', organizationId)
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
    enabled: !!organizationId && !orgLoading,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    properties: query.data ?? [],
    setProperties: (props: Property[]) => {
      queryClient.setQueryData(['properties', organizationId], props);
    },
    loading: orgLoading || query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch
  };
};
