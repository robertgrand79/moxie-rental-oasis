
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import PropertyForm from '@/components/PropertyForm';
import PropertyList from '@/components/PropertyList';
import EmptyPropertyState from '@/components/EmptyPropertyState';
import { useProperties } from '@/hooks/useProperties';
import { usePropertyPages } from '@/hooks/usePropertyPages';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';
import { Property } from '@/types/property';
import { PropertyFormData } from '@/components/PropertyForm/types';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { EnhancedCard, EnhancedCardContent } from '@/components/ui/enhanced-card';
import LoadingState from '@/components/ui/loading-state';

const Properties = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const { properties, loading, addProperty, editProperty, deleteProperty } = useProperties();
  const { createPropertyPage } = usePropertyPages();
  const { uploadPhotos } = usePhotoUpload();

  const handleAddProperty = () => {
    setShowAddForm(true);
    setEditingProperty(null);
  };

  const handleEditProperty = (property: Property) => {
    setEditingProperty(property);
    setShowAddForm(true);
  };

  const handleFormSubmit = async (data: PropertyFormData & { photos: File[]; selectedCoverIndex?: number }) => {
    console.log('Form submitted with data:', data);
    
    let uploadedImageUrls: string[] = [];
    let coverImageUrl: string | undefined;

    // Upload new photos if any
    if (data.photos && data.photos.length > 0) {
      const tempPropertyId = editingProperty?.id || `temp-${Date.now()}`;
      uploadedImageUrls = await uploadPhotos(data.photos, tempPropertyId);
    }

    // Combine existing images with new uploads
    const allImages = [...(editingProperty?.images || []), ...uploadedImageUrls];
    
    // Determine cover image
    if (data.selectedCoverIndex !== undefined && allImages[data.selectedCoverIndex]) {
      coverImageUrl = allImages[data.selectedCoverIndex];
    } else if (allImages.length > 0) {
      coverImageUrl = allImages[0];
    }

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
      image_url: coverImageUrl,
      images: allImages,
    };

    let savedProperty;
    
    if (editingProperty) {
      savedProperty = await editProperty(editingProperty.id, propertyData);
    } else {
      savedProperty = await addProperty(propertyData);
      // Create a page for the new property
      if (savedProperty) {
        await createPropertyPage(savedProperty);
      }
    }
    
    setShowAddForm(false);
    setEditingProperty(null);
  };

  const handleFormCancel = () => {
    setShowAddForm(false);
    setEditingProperty(null);
  };

  if (loading) {
    return <LoadingState variant="page" message="Loading your properties..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gradient-from to-gradient-to">
      <div className="container mx-auto px-4 py-8">
        <EnhancedCard variant="glass" className="mx-auto animate-fade-in">
          <EnhancedCardContent className="p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Property Management
                </h1>
                <p className="text-gray-600 mt-2">Manage your rental properties and listings</p>
              </div>
              {!showAddForm && (
                <EnhancedButton 
                  onClick={handleAddProperty} 
                  variant="gradient"
                  icon={<Plus className="h-4 w-4" />}
                >
                  Add Property
                </EnhancedButton>
              )}
            </div>

            {showAddForm && (
              <div className="mb-8 animate-scale-in">
                <PropertyForm 
                  initialData={editingProperty || undefined}
                  isEditing={!!editingProperty}
                  onSubmit={handleFormSubmit}
                  onCancel={handleFormCancel}
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
                  />
                ) : (
                  <EmptyPropertyState onAddProperty={handleAddProperty} />
                )}
              </div>
            )}
          </EnhancedCardContent>
        </EnhancedCard>
      </div>
    </div>
  );
};

export default Properties;
