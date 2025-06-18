
import { useState } from 'react';
import { usePropertyOperations } from './usePropertyOperations';
import { usePropertyDeletion } from './usePropertyDeletion';
import { Property } from '@/types/property';

export const usePropertyForm = (properties: Property[] = [], refetch?: () => void) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addProperty: addPropertyOperation, editProperty: editPropertyOperation } = usePropertyOperations();
  const { deletingProperties, deleteProperty: deletePropertyOperation } = usePropertyDeletion();

  const handleAddProperty = () => {
    setEditingProperty(null);
    setShowAddForm(true);
  };

  const handleEditProperty = (property: Property) => {
    setEditingProperty(property);
    setShowAddForm(true);
  };

  const handleFormSubmit = async (propertyData: any) => {
    setIsSubmitting(true);
    try {
      if (editingProperty) {
        await editPropertyOperation(editingProperty.id, propertyData);
      } else {
        await addPropertyOperation(propertyData);
      }
      setShowAddForm(false);
      setEditingProperty(null);
      refetch?.();
    } catch (error) {
      console.error('Error submitting property form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormCancel = () => {
    setShowAddForm(false);
    setEditingProperty(null);
  };

  const deleteProperty = async (propertyId: string) => {
    await deletePropertyOperation(propertyId, properties, () => refetch?.());
  };

  return {
    showAddForm,
    editingProperty,
    isSubmitting,
    deletingProperties,
    handleAddProperty,
    handleEditProperty,
    handleFormSubmit,
    handleFormCancel,
    deleteProperty,
  };
};
