import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Place {
  id: string;
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  location_text?: string;
  phone?: string;
  website_url?: string;
  rating?: number;
  price_level?: number;
  image_url?: string;
  images?: string[];
  is_featured?: boolean;
  is_active?: boolean;
  display_order?: number;
  status: 'published' | 'draft';
  activity_type?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

export const usePlaces = () => {
  const { data: places = [], isLoading, error } = useQuery({
    queryKey: ['places'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('places')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) {
        console.error('Error fetching places:', error);
        throw error;
      }
      
      return data as Place[];
    },
  });

  return { places, isLoading, error };
};

export const useCreatePlace = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (place: Partial<Place> & { name: string; category: string; created_by: string }) => {
      const { data, error } = await supabase
        .from('places')
        .insert([place])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] });
      toast({
        title: 'Place created',
        description: 'The place has been successfully created.',
      });
    },
    onError: (error) => {
      console.error('Error creating place:', error);
      toast({
        title: 'Error',
        description: 'Failed to create place. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdatePlace = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Place> & { id: string }) => {
      const { data, error } = await supabase
        .from('places')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] });
      toast({
        title: 'Place updated',
        description: 'The place has been successfully updated.',
      });
    },
    onError: (error) => {
      console.error('Error updating place:', error);
      toast({
        title: 'Error',
        description: 'Failed to update place. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

export const useDeletePlace = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('places')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['places'] });
      toast({
        title: 'Place deleted',
        description: 'The place has been successfully deleted.',
      });
    },
    onError: (error) => {
      console.error('Error deleting place:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete place. Please try again.',
        variant: 'destructive',
      });
    },
  });
};