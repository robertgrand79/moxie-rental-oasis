import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import type { Page } from '@/types/page';

export const useNavigationPages = (organizationId?: string | null) => {
  const { tenantId } = useTenant();
  
  // Use provided organizationId or fall back to tenantId from context
  const effectiveOrgId = organizationId ?? tenantId;

  return useQuery({
    queryKey: ['navigation-pages', effectiveOrgId],
    queryFn: async (): Promise<Page[]> => {
      if (!effectiveOrgId) return [];

      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('organization_id', effectiveOrgId)
        .eq('is_published', true)
        .eq('show_in_nav', true)
        .order('nav_order', { ascending: true });

      if (error) {
        console.error('Error fetching navigation pages:', error);
        return [];
      }

      return data as Page[];
    },
    enabled: !!effectiveOrgId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};
