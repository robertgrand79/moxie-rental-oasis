
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Property } from '@/types/property';
import { usePhotoUpload } from './usePhotoUpload';
import { usePropertyPages } from './usePropertyPages';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { uploadPhotos } = usePhotoUpload();
  const { createPropertyPage } = usePropertyPages();
  const { user } = useAuth();

  // Fetch properties from database
  const fetchProperties = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching properties:', error);
        toast({
          title: "Error",
          description: "Failed to fetch properties from database.",
          variant: "destructive",
        });
        return;
      }

      // Transform database data to match Property interface
      const transformedProperties: Property[] = (data || []).map(prop => ({
        id: prop.id,
        title: prop.title,
        description: prop.description,
        location: prop.location,
        bedrooms: prop.bedrooms,
        bathrooms: prop.bathrooms,
        maxGuests: prop.max_guests,
        pricePerNight: Number(prop.price_per_night),
        imageUrl: prop.image_url || '/placeholder.svg',
        images: prop.images || [],
        hospitableBookingUrl: prop.hospitable_booking_url,
        amenities: prop.amenities
      }));

      setProperties(transformedProperties);
    } catch (error) {
      console.error('Error in fetchProperties:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching properties.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load properties on mount
  useEffect(() => {
    fetchProperties();
  }, []);

  const addProperty = async (data: any) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to add properties.",
        variant: "destructive",
      });
      return;
    }

    console.log('Property form submitted:', data);
    
    try {
      let images: string[] = [];
      let imageUrl = '/placeholder.svg';

      // Upload photos if any were provided
      if (data.photos && data.photos.length > 0) {
        console.log('Uploading photos for new property:', data.photos.length);
        const propertyId = Date.now().toString(); // Temporary ID for uploads
        const uploadedUrls = await uploadPhotos(data.photos, propertyId);
        if (uploadedUrls.length > 0) {
          images = uploadedUrls;
          // Use selected cover image or first image as cover
          const coverIndex = data.selectedCoverIndex ?? 0;
          imageUrl = uploadedUrls[coverIndex] || uploadedUrls[0];
          console.log('Using image as cover:', imageUrl);
        }
      }

      // Insert property into database
      const { data: insertedProperty, error } = await supabase
        .from('properties')
        .insert([{
          title: data.title,
          description: data.description,
          location: data.location,
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          max_guests: data.maxGuests,
          price_per_night: data.pricePerNight,
          hospitable_booking_url: data.hospitableBookingUrl,
          amenities: data.amenities,
          image_url: imageUrl,
          images: images,
          created_by: user.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error inserting property:', error);
        toast({
          title: "Error",
          description: "Failed to save property to database.",
          variant: "destructive",
        });
        return;
      }

      // Transform and add to local state
      const newProperty: Property = {
        id: insertedProperty.id,
        title: insertedProperty.title,
        description: insertedProperty.description,
        location: insertedProperty.location,
        bedrooms: insertedProperty.bedrooms,
        bathrooms: insertedProperty.bathrooms,
        maxGuests: insertedProperty.max_guests,
        pricePerNight: Number(insertedProperty.price_per_night),
        imageUrl: insertedProperty.image_url || '/placeholder.svg',
        images: insertedProperty.images || [],
        hospitableBookingUrl: insertedProperty.hospitable_booking_url,
        amenities: insertedProperty.amenities
      };

      setProperties(prev => [newProperty, ...prev]);
      
      // Create corresponding page for SEO
      await createPropertyPage(newProperty);
      
      toast({
        title: "Property Added",
        description: "Your property and its dedicated page have been successfully created.",
      });
    } catch (error) {
      console.error('Error in addProperty:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while adding the property.",
        variant: "destructive",
      });
    }
  };

  const editProperty = async (id: string, data: any) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to edit properties.",
        variant: "destructive",
      });
      return;
    }

    console.log('Edit property:', id, data);
    
    try {
      // Get existing property to preserve current images
      const existingProperty = properties.find(p => p.id === id);
      const currentImages = existingProperty?.images || [];
      let newImages: string[] = currentImages;
      let imageUrl: string | undefined;

      // Upload new photos if any were provided
      if (data.photos && data.photos.length > 0) {
        console.log('Uploading new photos for existing property:', data.photos.length);
        const uploadedUrls = await uploadPhotos(data.photos, id);
        if (uploadedUrls.length > 0) {
          newImages = [...currentImages, ...uploadedUrls];
          console.log('Combined images:', newImages);
        }
      }

      // Set cover image based on selection
      if (newImages.length > 0) {
        const coverIndex = data.selectedCoverIndex ?? 0;
        imageUrl = newImages[coverIndex] || newImages[0];
      }

      // Update property in database
      const updateData: any = {
        title: data.title,
        description: data.description,
        location: data.location,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        max_guests: data.maxGuests,
        price_per_night: data.pricePerNight,
        hospitable_booking_url: data.hospitableBookingUrl,
        amenities: data.amenities,
        images: newImages,
        updated_at: new Date().toISOString()
      };

      if (imageUrl) {
        updateData.image_url = imageUrl;
      }

      const { error } = await supabase
        .from('properties')
        .update(updateData)
        .eq('id', id)
        .eq('created_by', user.id);

      if (error) {
        console.error('Error updating property:', error);
        toast({
          title: "Error",
          description: "Failed to update property in database.",
          variant: "destructive",
        });
        return;
      }

      // Update local state
      setProperties(prev => prev.map(property => 
        property.id === id 
          ? {
              ...property,
              title: data.title,
              description: data.description,
              location: data.location,
              bedrooms: data.bedrooms,
              bathrooms: data.bathrooms,
              maxGuests: data.maxGuests,
              pricePerNight: data.pricePerNight,
              hospitableBookingUrl: data.hospitableBookingUrl,
              amenities: data.amenities,
              images: newImages,
              ...(imageUrl && { imageUrl })
            }
          : property
      ));
      
      toast({
        title: "Property Updated",
        description: "Your property has been successfully updated.",
      });
    } catch (error) {
      console.error('Error in editProperty:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating the property.",
        variant: "destructive",
      });
    }
  };

  const deleteProperty = async (id: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to delete properties.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id)
        .eq('created_by', user.id);

      if (error) {
        console.error('Error deleting property:', error);
        toast({
          title: "Error",
          description: "Failed to delete property from database.",
          variant: "destructive",
        });
        return;
      }

      setProperties(prev => prev.filter(prop => prop.id !== id));
      toast({
        title: "Property Deleted",
        description: "The property has been removed from your listings.",
      });
    } catch (error) {
      console.error('Error in deleteProperty:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the property.",
        variant: "destructive",
      });
    }
  };

  return {
    properties,
    loading,
    addProperty,
    editProperty,
    deleteProperty,
    fetchProperties
  };
};
