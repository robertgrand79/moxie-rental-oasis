import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Property } from '@/types/property';
import { toast } from '@/hooks/use-toast';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';

interface UsePaginatedPropertiesResult {
  properties: Property[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  refetch: () => void;
}

const PROPERTIES_PER_PAGE = 20;

export const usePaginatedProperties = (): UsePaginatedPropertiesResult => {
  const { organization, loading: orgLoading } = useCurrentOrganization();
  const organizationId = organization?.id;
  const [currentPage, setCurrentPage] = useState(1);

  const query = useQuery({
    queryKey: ['properties-paginated', organizationId, currentPage],
    queryFn: async () => {
      if (!organizationId) return { data: [] as Property[], count: 0 };

      const offset = (currentPage - 1) * PROPERTIES_PER_PAGE;
      const { data, error, count } = await supabase
        .from('properties')
        .select('*', { count: 'exact' })
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .range(offset, offset + PROPERTIES_PER_PAGE - 1);

      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch properties',
          variant: 'destructive',
        });
        throw error;
      }

      return { data: data || [], count: count || 0 };
    },
    enabled: !!organizationId && !orgLoading,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  const totalCount = query.data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / PROPERTIES_PER_PAGE);
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return {
    properties: query.data?.data ?? [],
    loading: orgLoading || query.isLoading,
    error: query.error?.message ?? null,
    currentPage,
    totalPages,
    totalCount,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    nextPage: () => hasNextPage && setCurrentPage(p => p + 1),
    previousPage: () => hasPreviousPage && setCurrentPage(p => p - 1),
    refetch: () => query.refetch(),
  };
};
