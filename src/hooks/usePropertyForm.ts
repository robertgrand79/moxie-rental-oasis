import { useState } from 'react';
import { usePropertyOperations } from './usePropertyOperations';
import { usePropertyDeletion } from './usePropertyDeletion';
import { Property } from '@/types/property';
import { PropertyFormData } from '@/components/PropertyForm/types';

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

  const handleFormSubmit = async (propertyData: PropertyFormData, goToFirstPage?: () => void, stayOnPage?: boolean) => {
    setIsSubmitting(true);
    try {
      console.log('🏠 Starting property form submission...', { isEdit: !!editingProperty, stayOnPage });
      
      let result;
      if (editingProperty) {
        console.log('📝 Editing existing property:', editingProperty.id);
        result = await editPropertyOperation(editingProperty.id, propertyData);
      } else {
        console.log('➕ Creating new property with data:', propertyData);
        result = await addPropertyOperation(propertyData);
        
        // For new properties, go to page 1 to see the newly created property
        if (result && goToFirstPage) {
          console.log('🔝 Going to first page to show new property');
          goToFirstPage();
        }
      }
      
      console.log('✅ Property operation completed:', result);
      
      // Only close form if not staying on page
      if (!stayOnPage) {
        setShowAddForm(false);
        setEditingProperty(null);
      }
      
      console.log('🔄 Calling refetch to refresh property list...');
      // Add a small delay to ensure database transaction is committed
      setTimeout(() => {
        refetch?.();
      }, 500);
      console.log('🏁 Property form submission complete');
    } catch (error) {
      console.error('❌ Error submitting property form:', error);
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
