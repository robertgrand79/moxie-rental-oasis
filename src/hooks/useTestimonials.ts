
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Testimonial {
  id: string;
  guest_name: string;
  guest_location?: string;
  guest_avatar_url?: string;
  rating: number;
  review_text?: string; // For backward compatibility
  content?: string; // New field
  property_id?: string;
  property_name?: string;
  stay_date?: string;
  is_featured?: boolean;
  display_order?: number;
  is_active?: boolean;
  status?: string;
  booking_platform?: string;
  external_review_id?: string; // New field for deduplication
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTestimonialData {
  guest_name: string;
  guest_location?: string;
  guest_avatar_url?: string;
  rating: number;
  content?: string;
  review_text?: string; // For backward compatibility
  property_id?: string;
  property_name?: string;
  stay_date?: string;
  is_featured?: boolean;
  display_order?: number;
  is_active?: boolean;
  status?: string;
  booking_platform?: string;
  created_by: string;
}

export const useTestimonials = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: testimonials = [], isLoading, error } = useQuery({
    queryKey: ['testimonials'],
    queryFn: async () => {
      console.log('🔄 Fetching testimonials...');
      // First, get testimonials without the join
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) {
        console.error('❌ Error fetching testimonials:', error);
        throw error;
      }
      console.log('✅ Testimonials fetched:', data?.length || 0, 'items');
      return data as Testimonial[];
    }
  });

  const createTestimonial = useMutation({
    mutationFn: async (testimonial: CreateTestimonialData) => {
      console.log('Creating testimonial with data:', testimonial);
      
      // Clean up the data - convert empty property_id to null
      const cleanData = {
        ...testimonial,
        property_id: testimonial.property_id && testimonial.property_id.trim() !== '' ? testimonial.property_id : null,
        content: testimonial.content || testimonial.review_text,
        review_text: testimonial.review_text || testimonial.content
      };
      
      console.log('Cleaned data for insertion:', cleanData);
      
      const { data, error } = await supabase
        .from('testimonials')
        .insert(cleanData)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating testimonial:', error);
        throw error;
      }
      console.log('Testimonial created successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      toast({
        title: "Success",
        description: "Testimonial created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create testimonial: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const updateTestimonial = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Testimonial> & { id: string }) => {
      console.log('Updating testimonial with data:', { id, updates });
      
      // Clean up the data - convert empty property_id to null
      const cleanUpdates = {
        ...updates,
        property_id: updates.property_id && updates.property_id.trim() !== '' ? updates.property_id : null
      };
      
      console.log('Cleaned updates for database:', cleanUpdates);
      
      const { data, error } = await supabase
        .from('testimonials')
        .update(cleanUpdates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating testimonial:', error);
        throw error;
      }
      console.log('Testimonial updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      toast({
        title: "Success",
        description: "Testimonial updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update testimonial: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  const deleteTestimonial = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
      toast({
        title: "Success",
        description: "Testimonial deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete testimonial: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  return {
    testimonials,
    isLoading,
    error,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial
  };
};
