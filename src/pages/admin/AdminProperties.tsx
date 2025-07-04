
import React, { useCallback } from 'react';
import { Plus } from 'lucide-react';
import { usePropertyForm } from '@/hooks/usePropertyForm';
import { usePaginatedProperties } from '@/hooks/usePaginatedProperties';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import LoadingState from '@/components/ui/loading-state';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import PropertyFormContainer from '@/components/admin/properties/PropertyFormContainer';
import PropertyListContainer from '@/components/admin/properties/PropertyListContainer';
import PaginationControls from '@/components/ui/pagination-controls';
import ImageCleanupButton from '@/components/admin/properties/ImageCleanupButton';
import PropertyDiagnostics from '@/components/admin/PropertyDiagnostics';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAdminStateReset } from '@/hooks/useAdminStateReset';

const AdminProperties = () => {
  const {
    properties,
    loading,
    currentPage,
    totalPages,
    totalCount,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    nextPage,
    previousPage,
    refetch,
  } = usePaginatedProperties();

  const {
    deletingProperties,
    showAddForm,
    editingProperty,
    isSubmitting,
    handleAddProperty,
    handleEditProperty,
    handleFormSubmit,
    handleFormCancel,
    deleteProperty
  } = usePropertyForm(properties, refetch);

  const handleFormSubmitWithPageReset = async (propertyData: any) => {
    await handleFormSubmit(propertyData, () => goToPage(1));
  };
  
  const isMobile = useIsMobile();

  // State reset handler for sidebar navigation
  const resetToDefaultState = useCallback(() => {
    handleFormCancel(); // This resets showAddForm and editingProperty
    goToPage(1); // Reset to first page
  }, [handleFormCancel, goToPage]);

  // Handle admin state reset when clicking same menu item
  useAdminStateReset({ onReset: resetToDefaultState });

  if (loading && currentPage === 1) {
    return <LoadingState variant="page" message="Loading your properties..." />;
  }

  const pageActions = !showAddForm ? (
    <div className="flex gap-2 flex-wrap">
      <ImageCleanupButton />
      <EnhancedButton 
        onClick={handleAddProperty} 
        variant="gradient"
        icon={<Plus className="h-4 w-4" />}
        disabled={isSubmitting}
        className={`${isMobile ? 'w-full min-h-[44px] px-4 py-3' : 'px-6 py-3'}`}
      >
        Add Property
      </EnhancedButton>
    </div>
  ) : null;

  return (
    <AdminPageWrapper
      title="Property Management"
      description={`Manage your rental properties and listings (${totalCount} properties)`}
      actions={pageActions}
    >
      <div className={isMobile ? 'p-4' : 'p-6'}>
        {/* Show diagnostics when there are issues */}
        {!showAddForm && totalCount === 0 && (
          <PropertyDiagnostics />
        )}

        {showAddForm && (
          <div className="mb-6">
            <PropertyFormContainer
              editingProperty={editingProperty}
              isSubmitting={isSubmitting}
              onFormSubmit={handleFormSubmitWithPageReset}
              onFormCancel={handleFormCancel}
            />
          </div>
        )}

        {!showAddForm && (
          <div className="space-y-6">
            <PropertyListContainer
              properties={properties}
              deletingProperties={deletingProperties}
              onEdit={handleEditProperty}
              onDelete={deleteProperty}
              onAddProperty={handleAddProperty}
            />

            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              itemsPerPage={20}
              onPageChange={goToPage}
              onNextPage={nextPage}
              onPreviousPage={previousPage}
              hasNextPage={hasNextPage}
              hasPreviousPage={hasPreviousPage}
              loading={loading}
              itemName="properties"
            />
          </div>
        )}
      </div>
    </AdminPageWrapper>
  );
};

export default AdminProperties;
