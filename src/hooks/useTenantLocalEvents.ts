import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

export interface LocalEvent {
  id: string;
  title: string;
  description: string;
  event_date: string;
  end_date: string;
  time_start: string;
  time_end: string;
  location: string;
  category: string;
  image_url: string;
  website_url: string;
  ticket_url: string;
  price_range: string;
  is_featured: boolean;
  is_active: boolean;
  is_recurring: boolean;
  recurrence_pattern: string;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  organization_id: string;
}

/**
 * Hook to fetch local events for the current tenant (public-facing).
 * Uses TenantContext which works for unauthenticated users.
 */
export const useTenantLocalEvents = (timeFilter: string = 'all', categoryFilter: string = 'all') => {
  const { tenantId, loading: tenantLoading } = useTenant();

  const query = useQuery({
    queryKey: ['tenant-local-events', tenantId],
    queryFn: async (): Promise<LocalEvent[]> => {
      if (!tenantId) return [];

      const { data, error } = await supabase
        .from('eugene_events')
        .select('*')
        .eq('organization_id', tenantId)
        .eq('is_active', true)
        .order('event_date', { ascending: true });

      if (error) {
        console.error('Error fetching tenant local events:', error);
        throw error;
      }

      return data as LocalEvent[];
    },
    enabled: !!tenantId && !tenantLoading,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes
  });

  // Filter events based on time and category (client-side for flexibility)
  const allEvents = query.data ?? [];
  const filteredEvents = allEvents.filter(event => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(event.event_date);
    eventDate.setHours(0, 0, 0, 0);

    // Time filtering
    let timeMatch = true;
    if (timeFilter === 'upcoming') {
      timeMatch = eventDate >= today;
    } else if (timeFilter === 'past') {
      timeMatch = eventDate < today;
    }

    // Category filtering
    let categoryMatch = true;
    if (categoryFilter !== 'all') {
      categoryMatch = event.category === categoryFilter;
    }

    return timeMatch && categoryMatch;
  });

  return {
    events: filteredEvents,
    isLoading: tenantLoading || query.isLoading,
    error: query.error?.message ?? null,
  };
};
