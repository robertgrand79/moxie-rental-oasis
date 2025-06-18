
import { Property } from '@/types/property';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const usePropertyOperations = () => {
  const { user } = useAuth();

  const addProperty = async (propertyData: Omit<Property, 'id'>): Promise<Property | null> => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to add properties.',
        variant: 'destructive'
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('properties')
        .insert({
          ...propertyData,
          created_by: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating property:', error);
        toast({
          title: 'Error',
          description: 'Failed to create property.',
          variant: 'destructive'
        });
        return null;
      }

      toast({
        title: 'Success',
        description: 'Property created successfully!'
      });
      
      return data;
    } catch (error) {
      console.error('Error in addProperty:', error);
      toast({
        title: 'Error',
        description: 'Failed to create property.',
        variant: 'destructive'
      });
      return null;
    }
  };

  const editProperty = async (propertyId: string, propertyData: Omit<Property, 'id'>): Promise<Property | null> => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .update(propertyData)
        .eq('id', propertyId)
        .select()
        .single();

      if (error) {
        console.error('Error updating property:', error);
        toast({
          title: 'Error',
          description: 'Failed to update property.',
          variant: 'destructive'
        });
        return null;
      }

      toast({
        title: 'Success',
        description: 'Property updated successfully!'
      });
      
      return data;
    } catch (error) {
      console.error('Error in editProperty:', error);
      toast({
        title: 'Error',
        description: 'Failed to update property.',
        variant: 'destructive'
      });
      return null;
    }
  };

  return {
    addProperty,
    editProperty
  };
};
