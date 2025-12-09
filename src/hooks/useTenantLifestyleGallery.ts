import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

export interface LifestyleGalleryItem {
  id: string;
  title: string;
  description: string;
  image_url: string;
  category: string;
  location: string;
  activity_type: string;
  display_order: number;
  is_featured: boolean;
  is_active: boolean;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  organization_id: string;
}

/**
 * Hook to fetch lifestyle gallery items for the current tenant (public-facing).
 * Uses TenantContext which works for unauthenticated users.
 */
export const useTenantLifestyleGallery = () => {
  const { tenantId, loading: tenantLoading } = useTenant();

  const query = useQuery({
    queryKey: ['tenant-lifestyle-gallery', tenantId],
    queryFn: async (): Promise<LifestyleGalleryItem[]> => {
      if (!tenantId) return [];

      const { data, error } = await supabase
        .from('lifestyle_gallery')
        .select('*')
        .eq('organization_id', tenantId)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching tenant lifestyle gallery:', error);
        throw error;
      }

      return data as LifestyleGalleryItem[];
    },
    enabled: !!tenantId && !tenantLoading,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });

  return {
    galleryItems: query.data ?? [],
    isLoading: tenantLoading || query.isLoading,
    error: query.error?.message ?? null,
  };
};
