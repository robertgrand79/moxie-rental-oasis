import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Property } from '@/types/property';

export const useImageCleanup = () => {
  const [cleaning, setCleaning] = useState(false);

  const validateImageUrl = async (imageUrl: string): Promise<boolean> => {
    try {
      // Extract the file path from the URL
      const urlParts = imageUrl.split('/property-images/');
      if (urlParts.length < 2) return false;
      
      const filePath = urlParts[1];
      
      // Check if file exists in storage
      const { data, error } = await supabase.storage
        .from('property-images')
        .list(filePath.split('/')[0], {
          limit: 1000,
          search: filePath.split('/').pop()
        });
      
      if (error) return false;
      
      return data && data.length > 0;
    } catch (error) {
      console.error('Error validating image:', error);
      return false;
    }
  };

  const cleanupBrokenImageReferences = async (): Promise<{
    propertiesUpdated: number;
    imagesRemoved: number;
  }> => {
    setCleaning(true);
    let propertiesUpdated = 0;
    let imagesRemoved = 0;

    try {
      // Get all properties
      const { data: properties, error } = await supabase
        .from('properties')
        .select('*');

      if (error) {
        throw new Error(`Failed to fetch properties: ${error.message}`);
      }

      for (const property of properties) {
        let needsUpdate = false;
        const updates: Partial<Property> = {};

        // Check main image
        if (property.image_url) {
          const isValid = await validateImageUrl(property.image_url);
          if (!isValid) {
            updates.image_url = null;
            needsUpdate = true;
            imagesRemoved++;
          }
        }

        // Check cover image
        if (property.cover_image_url) {
          const isValid = await validateImageUrl(property.cover_image_url);
          if (!isValid) {
            updates.cover_image_url = null;
            needsUpdate = true;
            imagesRemoved++;
          }
        }

        // Check images array
        if (property.images && Array.isArray(property.images)) {
          const validImages = [];
          for (const imageUrl of property.images) {
            const isValid = await validateImageUrl(imageUrl);
            if (isValid) {
              validImages.push(imageUrl);
            } else {
              imagesRemoved++;
            }
          }
          if (validImages.length !== property.images.length) {
            updates.images = validImages;
            needsUpdate = true;
          }
        }

        // Check featured photos
        if (property.featured_photos && Array.isArray(property.featured_photos)) {
          const validFeaturedPhotos = [];
          for (const imageUrl of property.featured_photos) {
            const isValid = await validateImageUrl(imageUrl);
            if (isValid) {
              validFeaturedPhotos.push(imageUrl);
            } else {
              imagesRemoved++;
            }
          }
          if (validFeaturedPhotos.length !== property.featured_photos.length) {
            updates.featured_photos = validFeaturedPhotos;
            needsUpdate = true;
          }
        }

        // Update property if needed
        if (needsUpdate) {
          const { error: updateError } = await supabase
            .from('properties')
            .update(updates)
            .eq('id', property.id);

          if (updateError) {
            console.error('Error updating property:', property.id, updateError);
          } else {
            propertiesUpdated++;
          }
        }
      }

      toast({
        title: 'Cleanup Complete',
        description: `Updated ${propertiesUpdated} properties and removed ${imagesRemoved} broken image references.`
      });

      return { propertiesUpdated, imagesRemoved };
    } catch (error) {
      console.error('Error during image cleanup:', error);
      toast({
        title: 'Cleanup Error',
        description: error instanceof Error ? error.message : 'Failed to cleanup broken images.',
        variant: 'destructive'
      });
      return { propertiesUpdated: 0, imagesRemoved: 0 };
    } finally {
      setCleaning(false);
    }
  };

  const findOrphanedImages = async (): Promise<string[]> => {
    try {
      // Get all images from storage
      const { data: storageFiles, error: storageError } = await supabase.storage
        .from('property-images')
        .list('', {
          limit: 1000,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (storageError) {
        throw new Error(`Failed to list storage files: ${storageError.message}`);
      }

      // Get all properties and their image references
      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select('image_url, cover_image_url, images, featured_photos');

      if (propertiesError) {
        throw new Error(`Failed to fetch properties: ${propertiesError.message}`);
      }

      // Collect all referenced image URLs
      const referencedImages = new Set<string>();
      properties.forEach(property => {
        if (property.image_url) referencedImages.add(property.image_url);
        if (property.cover_image_url) referencedImages.add(property.cover_image_url);
        if (property.images) property.images.forEach((url: string) => referencedImages.add(url));
        if (property.featured_photos) property.featured_photos.forEach((url: string) => referencedImages.add(url));
      });

      // Find orphaned files
      const orphanedFiles: string[] = [];
      const { data: { publicUrl: baseUrl } } = supabase.storage
        .from('property-images')
        .getPublicUrl('');
      
      storageFiles.forEach(file => {
        const fullUrl = baseUrl + file.name;
        if (!referencedImages.has(fullUrl)) {
          orphanedFiles.push(file.name);
        }
      });

      return orphanedFiles;
    } catch (error) {
      console.error('Error finding orphaned images:', error);
      toast({
        title: 'Error',
        description: 'Failed to find orphaned images.',
        variant: 'destructive'
      });
      return [];
    }
  };

  const deleteOrphanedImages = async (orphanedFiles: string[]): Promise<number> => {
    try {
      if (orphanedFiles.length === 0) return 0;

      const { error } = await supabase.storage
        .from('property-images')
        .remove(orphanedFiles);

      if (error) {
        throw new Error(`Failed to delete orphaned files: ${error.message}`);
      }

      toast({
        title: 'Success',
        description: `Deleted ${orphanedFiles.length} orphaned image(s).`
      });

      return orphanedFiles.length;
    } catch (error) {
      console.error('Error deleting orphaned images:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete orphaned images.',
        variant: 'destructive'
      });
      return 0;
    }
  };

  return {
    cleaning,
    validateImageUrl,
    cleanupBrokenImageReferences,
    findOrphanedImages,
    deleteOrphanedImages
  };
};