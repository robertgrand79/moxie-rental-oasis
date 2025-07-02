import { useState } from 'react';
import { Property } from '@/types/property';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { usePropertyPages } from '@/hooks/usePropertyPages';

export const useEnhancedPropertyDeletion = () => {
  const [deletingProperties, setDeletingProperties] = useState<Set<string>>(new Set());
  const { deletePropertyPage } = usePropertyPages();

  const extractImageUrls = (property: Property): string[] => {
    const imageUrls: string[] = [];
    
    // Add main image
    if (property.image_url) {
      imageUrls.push(property.image_url);
    }
    
    // Add cover image
    if (property.cover_image_url) {
      imageUrls.push(property.cover_image_url);
    }
    
    // Add all images from images array
    if (property.images && Array.isArray(property.images)) {
      imageUrls.push(...property.images);
    }
    
    // Add featured photos
    if (property.featured_photos && Array.isArray(property.featured_photos)) {
      imageUrls.push(...property.featured_photos);
    }
    
    // Remove duplicates and filter out empty strings
    return [...new Set(imageUrls)].filter(url => url && url.trim() !== '');
  };

  const deletePhotoFromStorage = async (imageUrl: string): Promise<boolean> => {
    try {
      // Extract the file path from the URL
      const urlParts = imageUrl.split('/property-images/');
      if (urlParts.length < 2) {
        console.warn('Invalid image URL format:', imageUrl);
        return false;
      }
      
      const filePath = urlParts[1];
      
      const { error } = await supabase.storage
        .from('property-images')
        .remove([filePath]);

      if (error) {
        console.error('Error deleting photo from storage:', error);
        return false;
      }
      
      console.log('Successfully deleted photo from storage:', filePath);
      return true;
    } catch (error) {
      console.error('Error in deletePhotoFromStorage:', error);
      return false;
    }
  };

  const deletePropertyPhotos = async (property: Property): Promise<{ success: number; failed: number }> => {
    const imageUrls = extractImageUrls(property);
    console.log('Deleting photos for property:', property.id, 'Total photos:', imageUrls.length);
    
    let success = 0;
    let failed = 0;
    
    // Delete photos in parallel for better performance
    const deletePromises = imageUrls.map(async (imageUrl) => {
      const deleted = await deletePhotoFromStorage(imageUrl);
      if (deleted) {
        success++;
      } else {
        failed++;
      }
    });
    
    await Promise.all(deletePromises);
    
    return { success, failed };
  };

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

      // Find the property to get its details for cleanup
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

      console.log('Starting enhanced property deletion for:', propertyId);

      // Step 1: Delete all associated photos from storage
      const photoDeleteResult = await deletePropertyPhotos(propertyToDelete);
      console.log('Photo deletion result:', photoDeleteResult);

      // Step 2: Delete the property from the database
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

      // Step 3: Delete the corresponding property page
      const pageDeleted = await deletePropertyPage(propertyToDelete);
      
      // Provide detailed feedback
      let message = 'Property deleted successfully!';
      if (photoDeleteResult.success > 0) {
        message += ` Cleaned up ${photoDeleteResult.success} photo(s).`;
      }
      if (photoDeleteResult.failed > 0) {
        message += ` ${photoDeleteResult.failed} photo(s) couldn't be deleted from storage.`;
      }
      if (!pageDeleted) {
        message += ' Page cleanup may have failed.';
      }

      toast({
        title: 'Success',
        description: message,
        variant: photoDeleteResult.failed > 0 || !pageDeleted ? 'destructive' : 'default'
      });

    } catch (error) {
      console.error('Error in enhanced deleteProperty:', error);
      
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
    deleteProperty,
    extractImageUrls,
    deletePropertyPhotos
  };
};