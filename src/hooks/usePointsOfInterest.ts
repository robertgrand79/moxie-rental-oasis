
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const usePointsOfInterest = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pointsOfInterest = [], isLoading, error } = useQuery({
    queryKey: ['points-of-interest'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('points_of_interest')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as PointOfInterest[];
    }
  });

  const createPointOfInterest = useMutation({
    mutationFn: async (poi: Omit<PointOfInterest, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('points_of_interest')
        .insert([poi])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['points-of-interest'] });
      toast({
        title: "Success",
        description: "Point of interest created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create point of interest: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const updatePointOfInterest = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PointOfInterest> & { id: string }) => {
      const { data, error } = await supabase
        .from('points_of_interest')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['points-of-interest'] });
      toast({
        title: "Success",
        description: "Point of interest updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update point of interest: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const deletePointOfInterest = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('points_of_interest')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['points-of-interest'] });
      toast({
        title: "Success",
        description: "Point of interest deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete point of interest: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  return {
    pointsOfInterest,
    isLoading,
    error,
    createPointOfInterest,
    updatePointOfInterest,
    deletePointOfInterest
  };
};
