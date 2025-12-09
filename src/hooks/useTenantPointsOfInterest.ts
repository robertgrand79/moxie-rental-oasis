import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

export interface PointOfInterest {
  id: string;
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  category: string;
  phone: string;
  website_url: string;
  image_url: string;
  rating: number;
  price_level: number;
  distance_from_properties: number;
  driving_time: number;
  walking_time: number;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  organization_id: string;
}

/**
 * Hook to fetch points of interest for the current tenant (public-facing).
 * Uses TenantContext which works for unauthenticated users.
 */
export const useTenantPointsOfInterest = () => {
  const { tenantId, loading: tenantLoading } = useTenant();

  const query = useQuery({
    queryKey: ['tenant-points-of-interest', tenantId],
    queryFn: async (): Promise<PointOfInterest[]> => {
      if (!tenantId) return [];

      const { data, error } = await supabase
        .from('points_of_interest')
        .select('*')
        .eq('organization_id', tenantId)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching tenant POIs:', error);
        throw error;
      }

      return data as PointOfInterest[];
    },
    enabled: !!tenantId && !tenantLoading,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });

  return {
    pointsOfInterest: query.data ?? [],
    isLoading: tenantLoading || query.isLoading,
    error: query.error?.message ?? null,
  };
};
