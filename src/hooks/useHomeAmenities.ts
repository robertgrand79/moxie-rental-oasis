import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';

export interface HomeAmenity {
  id: string;
  organization_id: string;
  name: string;
  icon_name: string;
  color: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type HomeAmenityInsert = Omit<HomeAmenity, 'id' | 'created_at' | 'updated_at'>;
export type HomeAmenityUpdate = Partial<HomeAmenityInsert> & { id: string };

export const useHomeAmenities = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { organization } = useCurrentOrganization();

  const { data: amenities = [], isLoading, error } = useQuery({
    queryKey: ['home_amenities', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];
      
      const { data, error } = await supabase
        .from('home_amenities')
        .select('*')
        .eq('organization_id', organization.id)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as HomeAmenity[];
    },
    enabled: !!organization?.id,
  });

  const createAmenity = useMutation({
    mutationFn: async (amenity: Omit<HomeAmenityInsert, 'organization_id'>) => {
      if (!organization?.id) throw new Error('No organization');
      
      const { data, error } = await supabase
        .from('home_amenities')
        .insert({ ...amenity, organization_id: organization.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home_amenities'] });
      toast({ title: 'Amenity created successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error creating amenity', description: error.message, variant: 'destructive' });
    },
  });

  const updateAmenity = useMutation({
    mutationFn: async ({ id, ...updates }: HomeAmenityUpdate) => {
      const { data, error } = await supabase
        .from('home_amenities')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home_amenities'] });
      toast({ title: 'Amenity updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error updating amenity', description: error.message, variant: 'destructive' });
    },
  });

  const deleteAmenity = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('home_amenities')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home_amenities'] });
      toast({ title: 'Amenity deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error deleting amenity', description: error.message, variant: 'destructive' });
    },
  });

  const reorderAmenities = useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const updates = orderedIds.map((id, index) => 
        supabase
          .from('home_amenities')
          .update({ display_order: index })
          .eq('id', id)
      );
      
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home_amenities'] });
    },
    onError: (error) => {
      toast({ title: 'Error reordering amenities', description: error.message, variant: 'destructive' });
    },
  });

  return {
    amenities,
    isLoading,
    error,
    createAmenity,
    updateAmenity,
    deleteAmenity,
    reorderAmenities,
  };
};

// Hook for public-facing use (fetches by tenant)
export const usePublicHomeAmenities = (organizationId: string | null) => {
  const { data: amenities = [], isLoading } = useQuery({
    queryKey: ['public_home_amenities', organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      
      const { data, error } = await supabase
        .from('home_amenities')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as HomeAmenity[];
    },
    enabled: !!organizationId,
  });

  return { amenities, isLoading };
};
