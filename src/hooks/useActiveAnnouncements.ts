import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';

export interface ActiveAnnouncement {
  id: string;
  title: string;
  content: string;
  announcement_type: 'announcement' | 'campaign' | 'banner';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  banner_style: 'info' | 'warning' | 'success' | 'error';
  cta_text: string | null;
  cta_url: string | null;
  created_at: string;
}

export function useActiveAnnouncements() {
  const { organization } = useCurrentOrganization();
  const orgTier = organization?.subscription_tier || 'starter';

  return useQuery({
    queryKey: ['active-announcements', orgTier],
    queryFn: async () => {
      // Fetch active announcements that target this org's tier
      const { data, error } = await supabase
        .from('platform_announcements')
        .select('id, title, content, announcement_type, priority, banner_style, cta_text, cta_url, created_at, target_tiers')
        .eq('is_active', true)
        .or('starts_at.is.null,starts_at.lte.now()')
        .or('ends_at.is.null,ends_at.gt.now()')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter by target tier on client side (since array contains is complex in PostgREST)
      const filtered = (data || []).filter((a: any) => 
        a.target_tiers?.includes(orgTier) || a.target_tiers?.includes('all')
      );

      return filtered as ActiveAnnouncement[];
    },
    enabled: !!organization,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}
