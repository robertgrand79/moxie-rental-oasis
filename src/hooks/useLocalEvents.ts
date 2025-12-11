import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAutoSync } from '@/hooks/useAutoSync';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';

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

// Keep backward compatibility alias
export type EugeneEvent = LocalEvent;

export const useLocalEvents = (timeFilter: string = 'all', categoryFilter: string = 'all') => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { triggerAutoSync } = useAutoSync({ enabled: true, debounceMs: 2000 });
  const { organization } = useCurrentOrganization();

  const { data: allEvents = [], isLoading, error } = useQuery({
    queryKey: ['local-events', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];
      
      const { data, error } = await supabase
        .from('eugene_events')
        .select('*')
        .eq('organization_id', organization.id)
        .order('event_date', { ascending: true });
      
      if (error) throw error;
      return data as LocalEvent[];
    },
    enabled: !!organization?.id
  });

  // Filter events based on time and category
  const events = allEvents.filter(event => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Parse YYYY-MM-DD string directly to avoid UTC timezone shift
    const [year, month, day] = event.event_date.split('-').map(Number);
    const eventDate = new Date(year, month - 1, day);
    
    // For multi-day events, use end_date for "past" determination
    let endDate = eventDate;
    if (event.end_date) {
      const [endYear, endMonth, endDay] = event.end_date.split('-').map(Number);
      endDate = new Date(endYear, endMonth - 1, endDay);
    }

    // Time filtering
    let timeMatch = true;
    if (timeFilter === 'upcoming') {
      timeMatch = endDate >= today;
    } else if (timeFilter === 'past') {
      timeMatch = endDate < today;
    }

    // Category filtering
    let categoryMatch = true;
    if (categoryFilter !== 'all') {
      categoryMatch = event.category === categoryFilter;
    }

    return timeMatch && categoryMatch;
  });

  const createEvent = useMutation({
    mutationFn: async (event: Omit<LocalEvent, 'id' | 'created_at' | 'updated_at' | 'organization_id'>) => {
      if (!organization?.id) throw new Error('No organization context');
      
      const { data, error } = await supabase
        .from('eugene_events')
        .insert([{ ...event, organization_id: organization.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['local-events'] });
      toast({
        title: "Success",
        description: "Event created successfully",
      });
      triggerAutoSync('event created');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create event: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const updateEvent = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<LocalEvent> & { id: string }) => {
      const { data, error } = await supabase
        .from('eugene_events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['local-events'] });
      toast({
        title: "Success",
        description: "Event updated successfully",
      });
      triggerAutoSync('event updated');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update event: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('eugene_events')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['local-events'] });
      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
      triggerAutoSync('event deleted');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete event: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  return {
    events,
    isLoading,
    error,
    createEvent,
    updateEvent,
    deleteEvent
  };
};

// Backward compatibility alias
export const useEugeneEvents = useLocalEvents;
