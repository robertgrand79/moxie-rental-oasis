
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Property } from '@/types/property';
import { usePhotoUpload } from './usePhotoUpload';
import { usePropertyPages } from './usePropertyPages';

export const useProperties = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const { toast } = useToast();
  const { uploadPhotos } = usePhotoUpload();
  const { createPropertyPage } = usePropertyPages();

  const addProperty = async (data: any) => {
    console.log('Property form submitted:', data);
    
    const propertyId = Date.now().toString();
    let images: string[] = [];
    let imageUrl = '/placeholder.svg';

    // Upload photos if any were provided
    if (data.photos && data.photos.length > 0) {
      console.log('Uploading photos for new property:', data.photos.length);
      const uploadedUrls = await uploadPhotos(data.photos, propertyId);
      if (uploadedUrls.length > 0) {
        images = uploadedUrls;
        // Use selected cover image or first image as cover
        const coverIndex = data.selectedCoverIndex ?? 0;
        imageUrl = uploadedUrls[coverIndex] || uploadedUrls[0];
        console.log('Using image as cover:', imageUrl);
      }
    }

    const newProperty: Property = {
      id: propertyId,
      title: data.title,
      description: data.description,
      location: data.location,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      maxGuests: data.maxGuests,
      pricePerNight: data.pricePerNight,
      hospitableBookingUrl: data.hospitableBookingUrl,
      amenities: data.amenities,
      imageUrl,
      images
    };

    setProperties(prev => [...prev, newProperty]);
    
    // Create corresponding page for SEO
    await createPropertyPage(newProperty);
    
    toast({
      title: "Property Added",
      description: "Your property and its dedicated page have been successfully created.",
    });
  };

  const editProperty = async (id: string, data: any) => {
    console.log('Edit property:', id, data);
    
    let newImages: string[] = [];
    let imageUrl: string | undefined;

    // Get existing property to preserve current images
    const existingProperty = properties.find(p => p.id === id);
    const currentImages = existingProperty?.images || [];

    // Upload new photos if any were provided
    if (data.photos && data.photos.length > 0) {
      console.log('Uploading new photos for existing property:', data.photos.length);
      const uploadedUrls = await uploadPhotos(data.photos, id);
      if (uploadedUrls.length > 0) {
        newImages = [...currentImages, ...uploadedUrls];
        console.log('Combined images:', newImages);
      }
    } else {
      newImages = currentImages;
    }

    // Set cover image based on selection
    if (newImages.length > 0) {
      const coverIndex = data.selectedCoverIndex ?? 0;
      imageUrl = newImages[coverIndex] || newImages[0];
    }
    
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
            // Only update imageUrl if we have images
            ...(imageUrl && { imageUrl })
          }
        : property
    ));
    
    toast({
      title: "Property Updated",
      description: "Your property has been successfully updated.",
    });
  };

  const deleteProperty = (id: string) => {
    setProperties(properties.filter(prop => prop.id !== id));
    toast({
      title: "Property Deleted",
      description: "The property has been removed from your listings.",
    });
  };

  return {
    properties,
    addProperty,
    editProperty,
    deleteProperty
  };
};
