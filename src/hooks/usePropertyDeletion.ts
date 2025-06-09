
import { useState } from 'react';
import { Property } from '@/types/property';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { usePropertyPages } from '@/hooks/usePropertyPages';

export const usePropertyDeletion = () => {
  const [deletingProperties, setDeletingProperties] = useState<Set<string>>(new Set());
  const { deletePropertyPage } = usePropertyPages();

  const deleteProperty = async (
    propertyId: string, 
    properties: Property[], 
    setProperties: React.Dispatch<React.SetStateAction<Property[]>>
  ) => {
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

  return {
    deletingProperties,
    deleteProperty
  };
};
