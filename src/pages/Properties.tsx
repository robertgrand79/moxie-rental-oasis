
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import PropertyForm from '@/components/PropertyForm';
import PropertyList from '@/components/PropertyList';
import EmptyPropertyState from '@/components/EmptyPropertyState';
import { useProperties } from '@/hooks/useProperties';

const Properties = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const { properties, addProperty, editProperty, deleteProperty } = useProperties();

  const handleAddProperty = () => {
    setShowAddForm(true);
  };

  const handleFormSubmit = (data: any) => {
    addProperty(data);
    setShowAddForm(false);
  };

  const handleFormCancel = () => {
    setShowAddForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Properties Management</h1>
            <p className="text-gray-600 mt-2">Manage your vacation rental properties</p>
          </div>
          {!showAddForm && (
            <Button onClick={handleAddProperty} className="flex items-center">
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
            />
          </div>
        )}

        {!showAddForm && (
          <>
            {properties.length > 0 ? (
              <PropertyList
                properties={properties}
                onEdit={editProperty}
                onDelete={deleteProperty}
              />
            ) : (
              <EmptyPropertyState onAddProperty={handleAddProperty} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Properties;
