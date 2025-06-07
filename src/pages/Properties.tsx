
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import PropertyForm from '@/components/PropertyForm';
import PropertyList from '@/components/PropertyList';
import EmptyPropertyState from '@/components/EmptyPropertyState';
import { useProperties } from '@/hooks/useProperties';
import { Property } from '@/types/property';

const Properties = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const { properties, addProperty, editProperty, deleteProperty } = useProperties();

  const handleAddProperty = () => {
    setEditingProperty(null);
    setShowAddForm(true);
  };

  const handleEditProperty = (property: Property) => {
    setEditingProperty(property);
    setShowAddForm(true);
  };

  const handleFormSubmit = (data: any) => {
    if (editingProperty) {
      editProperty(editingProperty.id, data);
    } else {
      addProperty(data);
    }
    setShowAddForm(false);
    setEditingProperty(null);
  };

  const handleFormCancel = () => {
    setShowAddForm(false);
    setEditingProperty(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gradient-from to-gradient-to">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 mx-auto border border-white/20">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Properties Management</h1>
              <p className="text-gray-600 mt-2">Manage your vacation rental properties</p>
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
                onSubmit={handleFormSubmit}
                onCancel={handleFormCancel}
                initialData={editingProperty || undefined}
                isEditing={!!editingProperty}
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
