import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  city: string | null;
  bedrooms: number;
  bathrooms: number;
  max_guests: number;
  price_per_night: number | null;
  image_url: string | null;
  images: string[] | null;
  amenities: string | null;
  cover_image_url: string | null;
  featured_photos: string[] | null;
  display_order: number | null;
  cleaning_fee: number | null;
  service_fee_percentage: number | null;
}

/**
 * Hook to fetch properties for the current tenant.
 */
export const useTenantProperties = () => {
  const { tenantId, tenant, loading: tenantLoading } = useTenant();

  const query = useQuery({
    queryKey: ['tenant-properties', tenantId],
    queryFn: async (): Promise<Property[]> => {
      if (!tenantId) {
        console.log('🏠 [TenantProperties] No tenantId, returning empty array');
        return [];
      }

      console.log('🏠 [TenantProperties] Fetching properties for org:', tenantId, tenant?.name);

      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('organization_id', tenantId)
        .order('display_order', { ascending: true, nullsFirst: false });

      if (error) {
        console.error('🏠 [TenantProperties] Error:', error.message);
        throw error;
      }

      console.log('🏠 [TenantProperties] Loaded', data?.length ?? 0, 'properties');
      return data as Property[];
    },
    enabled: !!tenantId && !tenantLoading,
    staleTime: 10 * 60 * 1000, // 10 minutes - public data changes infrequently
    gcTime: 30 * 60 * 1000, // Keep in cache 30 minutes
  });

  return {
    properties: query.data ?? [],
    loading: tenantLoading || query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  };
};
