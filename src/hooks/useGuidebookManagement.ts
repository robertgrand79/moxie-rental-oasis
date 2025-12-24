import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';

export interface ApplianceGuide {
  name: string;
  icon?: string;
  instructions: string;
  tips?: string;
  troubleshooting?: string;
}

export interface GuidebookContent {
  welcome_message?: string;
  check_in_instructions?: string;
  check_out_instructions?: string;
  door_code?: string;
  parking_instructions?: string;
  house_rules?: string[];
  amenities?: string[];
  wifi?: {
    network: string;
    password: string;
  };
  appliance_guides?: ApplianceGuide[];
  local_recommendations?: {
    restaurants?: Array<{
      name: string;
      type: string;
      distance: string;
      rating: number;
      description: string;
      phone?: string;
      website?: string;
    }>;
    activities?: Array<{
      name: string;
      type: string;
      distance: string;
      description: string;
      hours?: string;
      website?: string;
    }>;
    shopping?: Array<{
      name: string;
      type: string;
      distance: string;
      description: string;
      hours?: string;
    }>;
    transportation?: {
      airport: string;
      parking: string;
      public_transit: string[];
      rideshare: string[];
    };
  };
  emergency_contacts?: Array<{
    name: string;
    role: string;
    phone: string;
    available: string;
  }>;
  property_address?: string;
  check_in_time?: string;
  check_out_time?: string;
}

export interface Guidebook {
  id: string;
  property_id: string;
  title: string;
  content: GuidebookContent;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useGuidebook = (propertyId: string | undefined) => {
  return useQuery({
    queryKey: ['guidebook', propertyId],
    queryFn: async () => {
      if (!propertyId) return null;
      
      const { data, error } = await supabase
        .from('property_guidebooks')
        .select('*')
        .eq('property_id', propertyId)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        return {
          ...data,
          content: data.content as unknown as GuidebookContent,
          is_active: data.is_active ?? true
        } as Guidebook;
      }
      return null;
    },
    enabled: !!propertyId,
  });
};

export const useCreateGuidebook = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      propertyId, 
      title, 
      content 
    }: { 
      propertyId: string; 
      title: string; 
      content: GuidebookContent 
    }) => {
      const { data, error } = await supabase
        .from('property_guidebooks')
        .insert({
          property_id: propertyId,
          title,
          content: content as unknown as Json,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['guidebook', variables.propertyId] });
      queryClient.invalidateQueries({ queryKey: ['properties-guidebooks'] });
      toast({
        title: 'Guidebook created',
        description: 'Your digital guidebook has been created successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error creating guidebook',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateGuidebook = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      id,
      propertyId,
      title, 
      content,
      is_active
    }: { 
      id: string;
      propertyId: string;
      title: string; 
      content: GuidebookContent;
      is_active?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('property_guidebooks')
        .update({
          title,
          content: content as unknown as Json,
          is_active: is_active ?? true,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['guidebook', variables.propertyId] });
      queryClient.invalidateQueries({ queryKey: ['properties-guidebooks'] });
      queryClient.invalidateQueries({ queryKey: ['property-guidebook', variables.propertyId] });
      toast({
        title: 'Guidebook updated',
        description: 'Your changes have been saved successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating guidebook',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};

export const useDeleteGuidebook = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, propertyId }: { id: string; propertyId: string }) => {
      const { error } = await supabase
        .from('property_guidebooks')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['guidebook', variables.propertyId] });
      queryClient.invalidateQueries({ queryKey: ['properties-guidebooks'] });
      toast({
        title: 'Guidebook deleted',
        description: 'The guidebook has been deleted.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error deleting guidebook',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
};
