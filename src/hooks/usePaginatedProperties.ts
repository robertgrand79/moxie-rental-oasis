import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Property } from '@/types/property';
import { toast } from '@/hooks/use-toast';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { debug } from '@/utils/debug';

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
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const totalPages = Math.ceil(totalCount / PROPERTIES_PER_PAGE);
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  const fetchProperties = async (page: number) => {
    if (!organization?.id) {
      setProperties([]);
      setTotalCount(0);
      setLoading(false);
      return;
    }

    try {
      debug.property('Starting fetchProperties for page:', page, 'org:', organization.id);
      setLoading(true);
      setError(null);

      const offset = (page - 1) * PROPERTIES_PER_PAGE;
      debug.property('Fetch offset:', offset, 'limit:', PROPERTIES_PER_PAGE);

      const { data, error: fetchError, count } = await supabase
        .from('properties')
        .select('*', { count: 'exact' })
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + PROPERTIES_PER_PAGE - 1);

      if (fetchError) {
        debug.error('Error fetching properties:', fetchError);
        setError(fetchError.message);
        toast({
          title: 'Error',
          description: 'Failed to fetch properties',
          variant: 'destructive',
        });
        return;
      }

      debug.property('Properties fetched successfully:', {
        count: data?.length,
        totalCount: count,
        firstProperty: data?.[0]?.title
      });

      setProperties(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      debug.error('Error in fetchProperties:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const previousPage = () => {
    if (hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const refetch = () => {
    debug.property('Refetching properties for page:', currentPage);
    fetchProperties(currentPage);
  };

  useEffect(() => {
    if (!orgLoading) {
      fetchProperties(currentPage);
    }
  }, [currentPage, organization?.id, orgLoading]);

  return {
    properties,
    loading,
    error,
    currentPage,
    totalPages,
    totalCount,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    nextPage,
    previousPage,
    refetch,
  };
};
