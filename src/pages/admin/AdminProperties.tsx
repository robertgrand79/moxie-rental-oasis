
import React from 'react';
import { Plus } from 'lucide-react';
import { usePropertyForm } from '@/hooks/usePropertyForm';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import LoadingState from '@/components/ui/loading-state';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import PropertyFormContainer from '@/components/admin/properties/PropertyFormContainer';
import PropertyListContainer from '@/components/admin/properties/PropertyListContainer';

const AdminProperties = () => {
  const {
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
  } = usePropertyForm();

  if (loading) {
    return <LoadingState variant="page" message="Loading your properties..." />;
  }

  const pageActions = !showAddForm ? (
    <EnhancedButton 
      onClick={handleAddProperty} 
      variant="gradient"
      icon={<Plus className="h-4 w-4" />}
      disabled={isSubmitting}
      className="px-6 py-3"
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
      <div className="p-6">
        {showAddForm && (
          <div className="mb-6">
            <PropertyFormContainer
              editingProperty={editingProperty}
              isSubmitting={isSubmitting}
              onFormSubmit={handleFormSubmit}
              onFormCancel={handleFormCancel}
            />
          </div>
        )}

        {!showAddForm && (
          <PropertyListContainer
            properties={properties}
            deletingProperties={deletingProperties}
            onEdit={handleEditProperty}
            onDelete={deleteProperty}
            onAddProperty={handleAddProperty}
          />
        )}
      </div>
    </AdminPageWrapper>
  );
};

export default AdminProperties;
