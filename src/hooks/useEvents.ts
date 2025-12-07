import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';

export interface Event {
  id: string;
  title: string;
  description?: string;
  category?: string;
  event_date: string;
  end_date?: string;
  time_start?: string;
  time_end?: string;
  location?: string;
  image_url?: string;
  website_url?: string;
  ticket_url?: string;
  price_range?: string;
  is_featured?: boolean;
  is_active?: boolean;
  is_recurring?: boolean;
  recurrence_pattern?: string;
  status: 'published' | 'draft';
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  place_id?: string;
  organization_id?: string;
}

export const useEvents = () => {
  const { organization } = useCurrentOrganization();
  
  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ['events', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];
      
      const { data, error } = await supabase
        .from('eugene_events')
        .select('*')
        .eq('organization_id', organization.id)
        .order('event_date', { ascending: true });
      
      if (error) {
        console.error('Error fetching events:', error);
        throw error;
      }
      
      return data as Event[];
    },
    enabled: !!organization?.id
  });

  return { events, isLoading, error };
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { organization } = useCurrentOrganization();

  return useMutation({
    mutationFn: async (event: Partial<Event> & { title: string; event_date: string; created_by: string }) => {
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
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: 'Event created',
        description: 'The event has been successfully created.',
      });
    },
    onError: (error) => {
      console.error('Error creating event:', error);
      toast({
        title: 'Error',
        description: 'Failed to create event. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Event> & { id: string }) => {
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
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: 'Event updated',
        description: 'The event has been successfully updated.',
      });
    },
    onError: (error) => {
      console.error('Error updating event:', error);
      toast({
        title: 'Error',
        description: 'Failed to update event. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('eugene_events')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: 'Event deleted',
        description: 'The event has been successfully deleted.',
      });
    },
    onError: (error) => {
      console.error('Error deleting event:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete event. Please try again.',
        variant: 'destructive',
      });
    },
  });
};
