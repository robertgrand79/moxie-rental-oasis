
import { Property } from '@/types/property';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useOptimizedPhotoUpload } from '@/hooks/useOptimizedPhotoUpload';
import type { PropertyFormData } from '@/types/property-form';
import { mapFormToDatabase, mapFormToDatabaseUpdate } from '@/types/property-form';

export const usePropertyOperations = () => {
  const { user } = useAuth();
  const { organization } = useCurrentOrganization();
  const { deletePhoto, uploadOptimizedPhotos } = useOptimizedPhotoUpload();

  const addProperty = async (propertyData: PropertyFormData): Promise<Property | null> => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to add properties.',
        variant: 'destructive'
      });
      return null;
    }

    // Validate organization context is loaded
    if (!organization?.id) {
      console.error('Property creation blocked: organization context is null', { user: user.id });
      toast({
        title: 'Error',
        description: 'Organization context not loaded. Please refresh the page and try again.',
        variant: 'destructive'
      });
      return null;
    }

    console.log('Adding property with organization:', organization.id, organization.name);

    try {
      // Handle photo uploads first if any
      let uploadedImages: string[] = [];
      if (propertyData.photos && propertyData.photos.length > 0) {
        // Create a temporary property ID for upload organization
        const tempPropertyId = `temp-${Date.now()}`;
        
        try {
          uploadedImages = await uploadOptimizedPhotos(propertyData.photos, tempPropertyId);
        } catch (uploadError) {
          console.warn('Photo upload failed, proceeding without images:', uploadError);
          // Continue without photos if upload fails
        }
      }

      // Map form data to database schema
      const cleanPropertyData = mapFormToDatabase(propertyData, uploadedImages, user.id, organization?.id);

      const { data, error } = await supabase
        .from('properties')
        .insert(cleanPropertyData)
        .select()
        .single();

      if (error) {
        toast({
          title: 'Error',
          description: `Failed to create property: ${error.message}`,
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
      toast({
        title: 'Error',
        description: `Failed to create property: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive'
      });
      return null;
    }
  };

  const editProperty = async (propertyId: string, propertyData: PropertyFormData): Promise<Property | null> => {
    try {
      // Handle deleted images from property updates
      if (propertyData.deletedImages && propertyData.deletedImages.length > 0) {
        // Delete each image from storage (only if it's a Supabase Storage URL)
        const deletePromises = propertyData.deletedImages
          .filter((imageUrl: string) => imageUrl.includes('/property-images/'))
          .map(async (imageUrl: string) => {
            const deleted = await deletePhoto(imageUrl);
            if (!deleted) {
              console.warn('Failed to delete image from storage:', imageUrl);
            }
            return deleted;
          });

        await Promise.all(deletePromises);
      }

      // Handle new photo uploads during edit
      let uploadedImages: string[] = [];
      if (propertyData.photos && propertyData.photos.length > 0) {
        try {
          uploadedImages = await uploadOptimizedPhotos(propertyData.photos, propertyId);
        } catch (uploadError) {
          console.error('Photo upload failed:', uploadError);
          toast({
            title: 'Photo Upload Error',
            description: 'Some photos failed to upload. Property will be saved without the new photos.',
            variant: 'destructive'
          });
        }
      }

      // Combine existing reordered images (excluding deleted ones) with newly uploaded images
      const existingImages = propertyData.reorderedExistingImages || [];
      const deletedImageSet = new Set(propertyData.deletedImages || []);
      const filteredExistingImages = existingImages.filter(img => !deletedImageSet.has(img));
      const allImages = [...filteredExistingImages, ...uploadedImages];
      
      // Map form data to database schema for update
      const cleanPropertyData = mapFormToDatabaseUpdate(propertyData, allImages);

      // Ensure featured photos are always a subset of the saved images
      const requestedFeatured = propertyData.featuredPhotos || [];
      cleanPropertyData.featured_photos = requestedFeatured
        .filter((url) => !url.startsWith('blob:'))
        .filter((url) => !deletedImageSet.has(url))
        .filter((url) => allImages.includes(url));
      const { error } = await supabase
        .from('properties')
        .update(cleanPropertyData)
        .eq('id', propertyId);

      if (error) {
        toast({
          title: 'Error',
          description: `Failed to update property: ${error.message}`,
          variant: 'destructive'
        });
        return null;
      }

      toast({
        title: 'Success',
        description: 'Property updated successfully!'
      });
      
      return { id: propertyId } as Property;
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to update property: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
