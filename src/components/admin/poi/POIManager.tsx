
import React, { useEffect } from 'react';
import { usePOIManager } from '@/hooks/usePOIManager';
import { usePOIUrlParams } from '@/hooks/usePOIUrlParams';
import POIEditorLayout from './POIEditorLayout';

const POIManager = () => {
  const {
    pointsOfInterest,
    isLoading,
    categories,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleEnhanceItem,
    handleAddNew,
    getSuggestions,
    isEnhancing,
    enhancingId,
    editingInlineId,
    handleToggleInlineEdit,
    editFormData,
    setEditFormData,
    handleSubmitInlineEdit,
    isSubmittingInline
  } = usePOIManager();

  usePOIUrlParams(handleAddNew);

  // Listen for reset event from navigation
  useEffect(() => {
    const handleReset = () => {
      // Reset to default state
      window.location.reload();
    };

    window.addEventListener('resetPOIManager', handleReset);
    return () => window.removeEventListener('resetPOIManager', handleReset);
  }, []);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded"></div>
        ))}
      </div>
    );
  }

  return (
    <POIEditorLayout
      pointsOfInterest={pointsOfInterest}
      categories={categories}
      isLoading={isLoading}
      onSubmit={handleSubmit}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onEnhance={handleEnhanceItem}
      isEnhancing={isEnhancing}
      enhancingId={enhancingId}
      getSuggestions={getSuggestions}
      editingInlineId={editingInlineId}
      onToggleInlineEdit={handleToggleInlineEdit}
      editFormData={editFormData}
      setEditFormData={setEditFormData}
      onSubmitInlineEdit={handleSubmitInlineEdit}
      isSubmittingInline={isSubmittingInline}
    />
  );
};

export default POIManager;
