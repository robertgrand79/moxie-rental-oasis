
import { Property } from '@/types/property';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';

export const usePropertyOperations = () => {
  const { user } = useAuth();
  const { deletePhoto } = usePhotoUpload();

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

  const editProperty = async (propertyId: string, propertyData: any): Promise<Property | null> => {
    try {
      console.log('Editing property with data:', propertyData);
      
      // Handle deleted images from property updates
      if (propertyData.deletedImages && propertyData.deletedImages.length > 0) {
        console.log('Deleting images from storage:', propertyData.deletedImages);
        
        // Delete each image from storage
        const deletePromises = propertyData.deletedImages.map(async (imageUrl: string) => {
          const deleted = await deletePhoto(imageUrl);
          if (!deleted) {
            console.warn('Failed to delete image from storage:', imageUrl);
          }
          return deleted;
        });
        
        await Promise.all(deletePromises);
      }
      
      // Prepare clean property data (remove form-specific fields)
      const cleanPropertyData = {
        title: propertyData.title,
        description: propertyData.description,
        location: propertyData.location,
        bedrooms: propertyData.bedrooms,
        bathrooms: propertyData.bathrooms,
        max_guests: propertyData.maxGuests,
        price_per_night: propertyData.pricePerNight,
        hospitable_booking_url: propertyData.hospitableBookingUrl || null,
        amenities: propertyData.amenities || null,
        images: propertyData.reorderedExistingImages || propertyData.images || [],
        featured_photos: propertyData.featuredPhotos || [],
        cover_image_url: propertyData.reorderedExistingImages?.[0] || propertyData.images?.[0] || null,
        image_url: propertyData.reorderedExistingImages?.[0] || propertyData.images?.[0] || null,
      };

      const { data, error } = await supabase
        .from('properties')
        .update(cleanPropertyData)
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
