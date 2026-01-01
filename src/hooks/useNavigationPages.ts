import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import type { Page } from '@/types/page';

export const useNavigationPages = () => {
  const { tenantId } = useTenant();

  return useQuery({
    queryKey: ['navigation-pages', tenantId],
    queryFn: async (): Promise<Page[]> => {
      if (!tenantId) return [];

      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('organization_id', tenantId)
        .eq('is_published', true)
        .eq('show_in_nav', true)
        .order('nav_order', { ascending: true });

      if (error) {
        console.error('Error fetching navigation pages:', error);
        return [];
      }

      return data as Page[];
    },
    enabled: !!tenantId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};
