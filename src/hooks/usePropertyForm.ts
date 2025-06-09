
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Property } from '@/types/property';
import { PropertyFormData } from '@/components/PropertyForm/types';
import { useProperties } from '@/hooks/useProperties';
import { usePropertyPages } from '@/hooks/usePropertyPages';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';

export const usePropertyForm = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const { properties, loading, deletingProperties, addProperty, editProperty, deleteProperty } = useProperties();
  const { createPropertyPage } = usePropertyPages();
  const { uploadPhotos } = usePhotoUpload();

  // Check for action parameter and auto-open add form
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'add') {
      setShowAddForm(true);
      setEditingProperty(null);
      // Clear the parameter from URL
      setSearchParams(prev => {
        prev.delete('action');
        return prev;
      });
    }
  }, [searchParams, setSearchParams]);

  const handleAddProperty = () => {
    setShowAddForm(true);
    setEditingProperty(null);
  };

  const handleEditProperty = (property: Property) => {
    setEditingProperty(property);
    setShowAddForm(true);
  };

  const handleFormSubmit = async (data: PropertyFormData & { photos: File[]; reorderedExistingImages?: string[]; featuredPhotos?: string[] }) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    console.log('Form submitted with data:', data);
    
    try {
      // Use reordered existing images if provided, otherwise use original
      const finalImages = data.reorderedExistingImages || editingProperty?.images || [];
      
      // The first image in the final images array is always the cover photo
      const coverImageUrl = finalImages.length > 0 ? finalImages[0] : undefined;
      const regularImageUrl = finalImages.length > 0 ? finalImages[0] : undefined;

      // Convert PropertyFormData to Property format
      const propertyData: Omit<Property, 'id'> = {
        title: data.title,
        description: data.description,
        location: data.location,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        max_guests: data.maxGuests,
        price_per_night: data.pricePerNight,
        hospitable_booking_url: data.hospitableBookingUrl,
        amenities: data.amenities,
        image_url: regularImageUrl,
        cover_image_url: coverImageUrl, // Set cover image to first photo
        images: finalImages,
        featured_photos: data.featuredPhotos || [],
      };

      let savedProperty;
      
      if (editingProperty) {
        savedProperty = await editProperty(editingProperty.id, propertyData);
      } else {
        savedProperty = await addProperty(propertyData);
      }

      if (!savedProperty) {
        console.error('Failed to save property');
        return;
      }

      // Upload new photos if any
      let uploadedImageUrls: string[] = [];
      if (data.photos && data.photos.length > 0) {
        console.log('Uploading photos for property ID:', savedProperty.id);
        uploadedImageUrls = await uploadPhotos(data.photos, savedProperty.id);
      }

      // Update property with complete image information
      if (uploadedImageUrls.length > 0) {
        const allImages = [...finalImages, ...uploadedImageUrls];
        
        // First image is always the cover photo
        const updatedCoverImageUrl = allImages.length > 0 ? allImages[0] : coverImageUrl;
        const updatedRegularImageUrl = allImages.length > 0 ? allImages[0] : regularImageUrl;

        console.log('Setting cover image (first photo):', updatedCoverImageUrl);

        // Update the property with the new images and cover image
        const updatedPropertyData = {
          ...propertyData,
          images: allImages,
          image_url: updatedRegularImageUrl,
          cover_image_url: updatedCoverImageUrl, // Always use first image as cover
          featured_photos: data.featuredPhotos || [],
        };

        console.log('Updating property with final data:', updatedPropertyData);
        savedProperty = await editProperty(savedProperty.id, updatedPropertyData);
      }

      // Create a page for new properties
      if (!editingProperty && savedProperty) {
        await createPropertyPage(savedProperty);
      }
      
      setShowAddForm(false);
      setEditingProperty(null);
    } catch (error) {
      console.error('Error in handleFormSubmit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormCancel = () => {
    if (isSubmitting) return;
    setShowAddForm(false);
    setEditingProperty(null);
  };

  return {
    properties,
    loading,
    deletingProperties,
    showAddForm,
    editingProperty,
    isSubmitting,
    handleAddProperty,
    handleEditProperty,
    handleFormSubmit,
    handleFormCancel,
    deleteProperty
  };
};
