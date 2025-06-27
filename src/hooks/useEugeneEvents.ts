import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAutoSync } from '@/hooks/useAutoSync';

export interface EugeneEvent {
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
}

export const useEugeneEvents = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { triggerAutoSync } = useAutoSync({ enabled: true, debounceMs: 2000 });

  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ['eugene-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('eugene_events')
        .select('*')
        .order('event_date', { ascending: true });
      
      if (error) throw error;
      return data as EugeneEvent[];
    }
  });

  const createEvent = useMutation({
    mutationFn: async (event: Omit<EugeneEvent, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('eugene_events')
        .insert([event])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eugene-events'] });
      toast({
        title: "Success",
        description: "Event created successfully",
      });
      
      // Trigger auto-sync for public content
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
    mutationFn: async ({ id, ...updates }: Partial<EugeneEvent> & { id: string }) => {
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
      queryClient.invalidateQueries({ queryKey: ['eugene-events'] });
      toast({
        title: "Success",
        description: "Event updated successfully",
      });
      
      // Trigger auto-sync for public content
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
      queryClient.invalidateQueries({ queryKey: ['eugene-events'] });
      toast({
        title: "Success",
        description: "Event deleted successfully",
      });
      
      // Trigger auto-sync for public content
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
