import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';

export interface PlaceCategory {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  display_order: number;
  is_active: boolean;
  organization_id: string;
  created_at?: string;
  updated_at?: string;
}

export const usePlaceCategories = () => {
  const { organization } = useCurrentOrganization();
  
  const { data: categories = [], isLoading, error, refetch } = useQuery({
    queryKey: ['place-categories', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];
      
      const { data, error } = await supabase
        .from('place_categories')
        .select('*')
        .eq('organization_id', organization.id)
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      if (error) {
        console.error('Error fetching place categories:', error);
        throw error;
      }
      
      return data as PlaceCategory[];
    },
    enabled: !!organization?.id
  });

  return { categories, isLoading, error, refetch };
};

export const useAllPlaceCategories = () => {
  const { organization } = useCurrentOrganization();
  
  const { data: categories = [], isLoading, error, refetch } = useQuery({
    queryKey: ['place-categories-all', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];
      
      const { data, error } = await supabase
        .from('place_categories')
        .select('*')
        .eq('organization_id', organization.id)
        .order('display_order', { ascending: true });
      
      if (error) {
        console.error('Error fetching all place categories:', error);
        throw error;
      }
      
      return data as PlaceCategory[];
    },
    enabled: !!organization?.id
  });

  return { categories, isLoading, error, refetch };
};

export const useCreatePlaceCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { organization } = useCurrentOrganization();

  return useMutation({
    mutationFn: async (category: Partial<PlaceCategory> & { name: string; slug: string }) => {
      if (!organization?.id) throw new Error('No organization context');
      
      const { data, error } = await supabase
        .from('place_categories')
        .insert([{ ...category, organization_id: organization.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['place-categories'] });
      queryClient.invalidateQueries({ queryKey: ['place-categories-all'] });
      toast({
        title: 'Category created',
        description: 'The category has been successfully created.',
      });
    },
    onError: (error: any) => {
      console.error('Error creating category:', error);
      toast({
        title: 'Error',
        description: error.message?.includes('duplicate') 
          ? 'A category with this slug already exists.' 
          : 'Failed to create category. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdatePlaceCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PlaceCategory> & { id: string }) => {
      const { data, error } = await supabase
        .from('place_categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['place-categories'] });
      queryClient.invalidateQueries({ queryKey: ['place-categories-all'] });
      toast({
        title: 'Category updated',
        description: 'The category has been successfully updated.',
      });
    },
    onError: (error: any) => {
      console.error('Error updating category:', error);
      toast({
        title: 'Error',
        description: error.message?.includes('duplicate') 
          ? 'A category with this slug already exists.' 
          : 'Failed to update category. Please try again.',
        variant: 'destructive',
      });
    },
  });
};

export const useDeletePlaceCategory = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      // First check if category is in use
      const { count } = await supabase
        .from('places')
        .select('*', { count: 'exact', head: true })
        .eq('category', id);
      
      if (count && count > 0) {
        throw new Error(`Cannot delete category: ${count} places are using it`);
      }

      const { error } = await supabase
        .from('place_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['place-categories'] });
      queryClient.invalidateQueries({ queryKey: ['place-categories-all'] });
      toast({
        title: 'Category deleted',
        description: 'The category has been successfully deleted.',
      });
    },
    onError: (error: any) => {
      console.error('Error deleting category:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete category. Please try again.',
        variant: 'destructive',
      });
    },
  });
};
