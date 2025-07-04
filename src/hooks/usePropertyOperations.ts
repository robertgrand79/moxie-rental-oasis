
import { Property } from '@/types/property';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';

export const usePropertyOperations = () => {
  const { user } = useAuth();
  const { deletePhoto, uploadPhotos } = usePhotoUpload();

  const addProperty = async (propertyData: any): Promise<Property | null> => {
    console.log('🏠 [ADD] Starting property creation...', { user: user?.id, hasData: !!propertyData });
    
    if (!user) {
      console.error('❌ [ADD] No authenticated user found');
      toast({
        title: 'Error',
        description: 'You must be logged in to add properties.',
        variant: 'destructive'
      });
      return null;
    }

    try {
      // Phase 2: Fix form data mapping - handle photo uploads first if any
      let uploadedImages: string[] = [];
      if (propertyData.photos && propertyData.photos.length > 0) {
        console.log('📸 [ADD] Uploading photos first...', propertyData.photos.length);
        // Create a temporary property ID for upload organization
        const tempPropertyId = `temp-${Date.now()}`;
        
        try {
          uploadedImages = await uploadPhotos(propertyData.photos, tempPropertyId);
          console.log('✅ [ADD] Photos uploaded successfully:', uploadedImages.length);
        } catch (uploadError) {
          console.warn('⚠️ [ADD] Photo upload failed, proceeding without images:', uploadError);
          // Phase 3: Continue without photos if upload fails
        }
      }

      // Phase 2: Map form fields correctly to database columns
      const cleanPropertyData = {
        title: propertyData.title,
        description: propertyData.description,
        location: propertyData.location,
        bedrooms: propertyData.bedrooms,
        bathrooms: propertyData.bathrooms,
        max_guests: propertyData.maxGuests, // Form field: maxGuests → DB field: max_guests
        price_per_night: propertyData.pricePerNight, // Form field: pricePerNight → DB field: price_per_night
        hospitable_booking_url: propertyData.hospitableBookingUrl || null, // Form field: hospitableBookingUrl → DB field: hospitable_booking_url
        amenities: propertyData.amenities || null,
        images: uploadedImages,
        featured_photos: (propertyData.featuredPhotos || []).filter((url: string) => !url.startsWith('blob:')),
        cover_image_url: uploadedImages[0] || null,
        image_url: uploadedImages[0] || null,
        display_order: 0,
        created_by: user.id
      };

      console.log('💾 [ADD] Inserting property with mapped data:', cleanPropertyData);

      const { data, error } = await supabase
        .from('properties')
        .insert(cleanPropertyData)
        .select()
        .single();

      if (error) {
        console.error('❌ [ADD] Database insert failed:', error);
        toast({
          title: 'Error',
          description: `Failed to create property: ${error.message}`,
          variant: 'destructive'
        });
        return null;
      }

      console.log('✅ [ADD] Property created successfully:', data?.id);
      toast({
        title: 'Success',
        description: 'Property created successfully!'
      });
      
      return data;
    } catch (error) {
      console.error('💥 [ADD] Unexpected error in addProperty:', error);
      toast({
        title: 'Error',
        description: `Failed to create property: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive'
      });
      return null;
    }
  };

  const editProperty = async (propertyId: string, propertyData: any): Promise<Property | null> => {
    console.log('🏠 [EDIT] Starting property update...', { propertyId, user: user?.id });
    
    try {
      // Handle deleted images from property updates
      if (propertyData.deletedImages && propertyData.deletedImages.length > 0) {
        console.log('🗑️ [EDIT] Deleting images from storage:', propertyData.deletedImages);
        
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

      // Handle new photo uploads during edit
      let uploadedImages: string[] = [];
      if (propertyData.photos && propertyData.photos.length > 0) {
        console.log('📸 [EDIT] Uploading new photos...', propertyData.photos.length);
        
        try {
          uploadedImages = await uploadPhotos(propertyData.photos, propertyId);
          console.log('✅ [EDIT] New photos uploaded successfully:', uploadedImages.length);
        } catch (uploadError) {
          console.error('❌ [EDIT] Photo upload failed:', uploadError);
          toast({
            title: 'Photo Upload Error',
            description: 'Some photos failed to upload. Property will be saved without the new photos.',
            variant: 'destructive'
          });
        }
      }

      // Combine existing reordered images with newly uploaded images
      const existingImages = propertyData.reorderedExistingImages || [];
      const allImages = [...existingImages, ...uploadedImages];
      
      console.log('🔄 [EDIT] Final image arrays:', {
        existingImages: existingImages.length,
        uploadedImages: uploadedImages.length,
        totalImages: allImages.length
      });
      
      // Prepare clean property data (remove form-specific fields and filter blob URLs)
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
        images: allImages,
        featured_photos: (propertyData.featuredPhotos || []).filter((url: string) => !url.startsWith('blob:')),
        cover_image_url: allImages[0] || null,
        image_url: allImages[0] || null,
      };

      const { data, error } = await supabase
        .from('properties')
        .update(cleanPropertyData)
        .eq('id', propertyId)
        .select()
        .single();

      if (error) {
        console.error('❌ [EDIT] Database update failed:', error);
        toast({
          title: 'Error',
          description: `Failed to update property: ${error.message}`,
          variant: 'destructive'
        });
        return null;
      }

      console.log('✅ [EDIT] Property updated successfully:', data?.id);
      toast({
        title: 'Success',
        description: 'Property updated successfully!'
      });
      
      return data;
    } catch (error) {
      console.error('💥 [EDIT] Unexpected error in editProperty:', error);
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
