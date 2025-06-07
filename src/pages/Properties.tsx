
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import PropertyForm from '@/components/PropertyForm';
import PropertyList from '@/components/PropertyList';
import EmptyPropertyState from '@/components/EmptyPropertyState';
import { useProperties } from '@/hooks/useProperties';
import { usePropertyPages } from '@/hooks/usePropertyPages';
import { Property } from '@/types/property';
import { PropertyFormData } from '@/components/PropertyForm/types';

const Properties = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const { properties, loading, addProperty, editProperty, deleteProperty } = useProperties();
  const { createPropertyPage } = usePropertyPages();

  const handleAddProperty = () => {
    setShowAddForm(true);
    setEditingProperty(null);
  };

  const handleEditProperty = (property: Property) => {
    setEditingProperty(property);
    setShowAddForm(true);
  };

  const handleFormSubmit = async (data: PropertyFormData & { photos: File[]; selectedCoverIndex?: number }) => {
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
      // Handle photos and images as needed
      image_url: undefined, // Will be set by photo upload logic
      images: [],
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-gradient-from to-gradient-to">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 mx-auto border border-white/20">
            <div className="text-center py-8">
              <p className="text-gray-600">Loading properties...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gradient-from to-gradient-to">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 mx-auto border border-white/20">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Property Management</h1>
              <p className="text-gray-600 mt-2">Manage your rental properties and listings</p>
            </div>
            {!showAddForm && (
              <Button onClick={handleAddProperty} className="flex items-center bg-gradient-to-r from-gradient-from to-gradient-accent-from hover:from-gradient-from/90 hover:to-gradient-accent-from/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Button>
            )}
          </div>

          {showAddForm && (
            <div className="mb-8">
              <PropertyForm 
                initialData={editingProperty || undefined}
                isEditing={!!editingProperty}
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
              />
            </div>
          )}

          {!showAddForm && (
            <>
              {properties.length > 0 ? (
                <PropertyList
                  properties={properties}
                  onEdit={handleEditProperty}
                  onDelete={deleteProperty}
                />
              ) : (
                <EmptyPropertyState onAddProperty={handleAddProperty} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Properties;
