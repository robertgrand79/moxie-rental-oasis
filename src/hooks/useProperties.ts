
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Property } from '@/types/property';

export const useProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchProperties = async () => {
    console.log('Fetching properties...');
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching properties:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch properties.',
          variant: 'destructive'
        });
        setProperties([]);
      } else {
        console.log('Fetched properties:', data);
        setProperties(data || []);
      }
    } catch (error) {
      console.error('Error in fetchProperties:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch properties.',
        variant: 'destructive'
      });
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

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
        .insert([{
          ...propertyData,
          created_by: user.id
        }])
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

      setProperties(prev => [data, ...prev]);
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

      setProperties(prev => prev.map(property => 
        property.id === propertyId ? data : property
      ));
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

  const deleteProperty = async (propertyId: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);

      if (error) {
        console.error('Error deleting property:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete property.',
          variant: 'destructive'
        });
        return;
      }

      setProperties(prev => prev.filter(property => property.id !== propertyId));
      toast({
        title: 'Success',
        description: 'Property deleted successfully!'
      });
    } catch (error) {
      console.error('Error in deleteProperty:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete property.',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  return {
    properties,
    loading,
    addProperty,
    editProperty,
    deleteProperty,
    refetch: fetchProperties
  };
};
