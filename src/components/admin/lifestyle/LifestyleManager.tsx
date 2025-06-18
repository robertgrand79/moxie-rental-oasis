
import React from 'react';
import { useLifestyleGalleryManager } from '@/hooks/useLifestyleGalleryManager';
import { useLifestyleUrlParams } from '@/hooks/useLifestyleUrlParams';
import LifestyleEditorLayout from './LifestyleEditorLayout';

const LifestyleManager = () => {
  const {
    galleryItems,
    isLoading,
    categories,
    activityTypes,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleEnhanceItem,
    handleAddNew,
    getSuggestions,
    enhancingId,
    isEnhancing
  } = useLifestyleGalleryManager();

  useLifestyleUrlParams(handleAddNew);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Loading lifestyle items...</div>
      </div>
    );
  }

  return (
    <LifestyleEditorLayout
      galleryItems={galleryItems}
      categories={categories}
      activityTypes={activityTypes}
      isLoading={isLoading}
      onSubmit={handleSubmit}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onEnhance={handleEnhanceItem}
      isEnhancing={isEnhancing}
      enhancingId={enhancingId}
      getSuggestions={getSuggestions}
    />
  );
};

export default LifestyleManager;
