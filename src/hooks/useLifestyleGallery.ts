import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';

export interface LifestyleGalleryItem {
  id: string;
  title: string;
  description: string;
  image_url: string;
  category: string;
  location: string;
  activity_type: string;
  display_order: number;
  is_featured: boolean;
  is_active: boolean;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  organization_id: string;
}

export const useLifestyleGallery = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { organization } = useCurrentOrganization();

  const { data: galleryItems = [], isLoading, error } = useQuery({
    queryKey: ['lifestyle-gallery', organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];
      
      const { data, error } = await supabase
        .from('lifestyle_gallery')
        .select('*')
        .eq('organization_id', organization.id)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as LifestyleGalleryItem[];
    },
    enabled: !!organization?.id
  });

  const createGalleryItem = useMutation({
    mutationFn: async (item: Omit<LifestyleGalleryItem, 'id' | 'created_at' | 'updated_at' | 'organization_id'>) => {
      if (!organization?.id) throw new Error('No organization context');
      
      const { data, error } = await supabase
        .from('lifestyle_gallery')
        .insert([{ ...item, organization_id: organization.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lifestyle-gallery'] });
      toast({
        title: "Success",
        description: "Gallery item created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create gallery item: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const updateGalleryItem = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<LifestyleGalleryItem> & { id: string }) => {
      const { data, error } = await supabase
        .from('lifestyle_gallery')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lifestyle-gallery'] });
      toast({
        title: "Success",
        description: "Gallery item updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update gallery item: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const deleteGalleryItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('lifestyle_gallery')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lifestyle-gallery'] });
      toast({
        title: "Success",
        description: "Gallery item deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete gallery item: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  return {
    galleryItems,
    isLoading,
    error,
    createGalleryItem,
    updateGalleryItem,
    deleteGalleryItem
  };
};
