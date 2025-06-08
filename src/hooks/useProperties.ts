
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Property } from '@/types/property';
import { usePropertyPages } from '@/hooks/usePropertyPages';

export const useProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingProperties, setDeletingProperties] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const { deletePropertyPage } = usePropertyPages();

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
    // Prevent multiple deletion attempts
    if (deletingProperties.has(propertyId)) {
      console.log('Property deletion already in progress for:', propertyId);
      return;
    }

    try {
      // Mark property as being deleted
      setDeletingProperties(prev => new Set(prev).add(propertyId));

      // Find the property to get its details for page cleanup
      const propertyToDelete = properties.find(p => p.id === propertyId);
      
      if (!propertyToDelete) {
        console.error('Property not found for deletion:', propertyId);
        toast({
          title: 'Error',
          description: 'Property not found.',
          variant: 'destructive'
        });
        return;
      }

      // Optimistically remove from UI
      setProperties(prev => prev.filter(property => property.id !== propertyId));

      console.log('Deleting property from database:', propertyId);

      // Delete the property from the database
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId);

      if (error) {
        console.error('Error deleting property from database:', error);
        
        // Restore property to UI on database error
        setProperties(prev => [propertyToDelete, ...prev]);
        
        toast({
          title: 'Error',
          description: 'Failed to delete property from database.',
          variant: 'destructive'
        });
        return;
      }

      console.log('Property deleted from database successfully');

      // Delete the corresponding property page
      const pageDeleted = await deletePropertyPage(propertyToDelete);
      
      if (pageDeleted) {
        toast({
          title: 'Success',
          description: 'Property and its page deleted successfully!'
        });
      } else {
        toast({
          title: 'Partial Success',
          description: 'Property deleted but page cleanup failed. You may need to manually remove the page.',
          variant: 'destructive'
        });
      }

    } catch (error) {
      console.error('Error in deleteProperty:', error);
      
      // Restore property to UI on error
      const propertyToDelete = properties.find(p => p.id === propertyId);
      if (propertyToDelete) {
        setProperties(prev => [propertyToDelete, ...prev]);
      }
      
      toast({
        title: 'Error',
        description: 'Failed to delete property.',
        variant: 'destructive'
      });
    } finally {
      // Remove from deleting set
      setDeletingProperties(prev => {
        const newSet = new Set(prev);
        newSet.delete(propertyId);
        return newSet;
      });
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  return {
    properties,
    loading,
    deletingProperties,
    addProperty,
    editProperty,
    deleteProperty,
    refetch: fetchProperties
  };
};
