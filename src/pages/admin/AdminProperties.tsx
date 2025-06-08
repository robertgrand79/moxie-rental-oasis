
import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import PropertyForm from '@/components/PropertyForm';
import PropertyList from '@/components/PropertyList';
import EmptyPropertyState from '@/components/EmptyPropertyState';
import { useProperties } from '@/hooks/useProperties';
import { usePropertyPages } from '@/hooks/usePropertyPages';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';
import { Property } from '@/types/property';
import { PropertyFormData } from '@/components/PropertyForm/types';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import LoadingState from '@/components/ui/loading-state';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';

const AdminProperties = () => {
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

  const handleFormSubmit = async (data: PropertyFormData & { photos: File[]; selectedCoverIndex?: number }) => {
    if (isSubmitting) return; // Prevent multiple submissions
    
    setIsSubmitting(true);
    console.log('Form submitted with data:', data);
    
    try {
      // Convert PropertyFormData to Property format first
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
        image_url: undefined, // Will be set after photo upload
        images: editingProperty?.images || [], // Keep existing images for edits
      };

      let savedProperty;
      
      if (editingProperty) {
        // For editing, update the property first
        savedProperty = await editProperty(editingProperty.id, propertyData);
      } else {
        // For new properties, create the property first to get the real ID
        savedProperty = await addProperty(propertyData);
      }

      if (!savedProperty) {
        console.error('Failed to save property');
        return;
      }

      // Upload new photos if any, using the actual property ID
      let uploadedImageUrls: string[] = [];
      if (data.photos && data.photos.length > 0) {
        console.log('Uploading photos for property ID:', savedProperty.id);
        uploadedImageUrls = await uploadPhotos(data.photos, savedProperty.id);
      }

      // If we have new uploaded images, update the property with the complete image list
      if (uploadedImageUrls.length > 0) {
        const allImages = [...(savedProperty.images || []), ...uploadedImageUrls];
        
        // Determine cover image
        let coverImageUrl: string | undefined;
        if (data.selectedCoverIndex !== undefined && allImages[data.selectedCoverIndex]) {
          coverImageUrl = allImages[data.selectedCoverIndex];
        } else if (allImages.length > 0) {
          coverImageUrl = allImages[0];
        }

        // Update the property with the new images
        const updatedPropertyData = {
          ...propertyData,
          images: allImages,
          image_url: coverImageUrl,
        };

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
    if (isSubmitting) return; // Prevent canceling during submission
    setShowAddForm(false);
    setEditingProperty(null);
  };

  if (loading) {
    return <LoadingState variant="page" message="Loading your properties..." />;
  }

  const pageActions = !showAddForm ? (
    <EnhancedButton 
      onClick={handleAddProperty} 
      variant="gradient"
      icon={<Plus className="h-4 w-4" />}
      disabled={isSubmitting}
    >
      Add Property
    </EnhancedButton>
  ) : null;

  return (
    <AdminPageWrapper
      title="Property Management"
      description={`Manage your rental properties and listings (${properties.length} properties)`}
      actions={pageActions}
    >
      <div className="p-8">
        {showAddForm && (
          <div className="mb-8 animate-scale-in">
            <PropertyForm 
              initialData={editingProperty || undefined}
              isEditing={!!editingProperty}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
              isSubmitting={isSubmitting}
            />
          </div>
        )}

        {!showAddForm && (
          <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
            {properties.length > 0 ? (
              <PropertyList
                properties={properties}
                onEdit={handleEditProperty}
                onDelete={deleteProperty}
                showActions={true}
                deletingProperties={deletingProperties}
              />
            ) : (
              <EmptyPropertyState onAddProperty={handleAddProperty} />
            )}
          </div>
        )}
      </div>
    </AdminPageWrapper>
  );
};

export default AdminProperties;
