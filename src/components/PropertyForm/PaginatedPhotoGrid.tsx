
import React from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import DraggablePhotoItem from './DraggablePhotoItem';
import PhotoGridHeader from './PhotoGridHeader';
import PhotoGridInstructions from './PhotoGridInstructions';
import PhotoGridPagination from './PhotoGridPagination';
import { usePhotoPagination } from '@/hooks/usePhotoPagination';

interface Photo {
  id: string;
  url: string;
  isExisting: boolean;
}

interface PaginatedPhotoGridProps {
  photos: Photo[];
  selectedCoverIndex?: number;
  featuredPhotos?: string[];
  onCoverSelect: (index: number) => void;
  onFeaturedPhotosChange: (photos: string[]) => void;
  onRemove: (index: number) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
  disabled?: boolean;
  itemsPerPage?: number;
}

const PaginatedPhotoGrid = ({
  photos,
  selectedCoverIndex,
  featuredPhotos = [],
  onCoverSelect,
  onFeaturedPhotosChange,
  onRemove,
  onMove,
  disabled = false,
  itemsPerPage = 12
}: PaginatedPhotoGridProps) => {
  const {
    currentPage,
    totalPages,
    startIndex,
    currentPhotos,
    handlePrevPage,
    handleNextPage
  } = usePhotoPagination(photos, itemsPerPage);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = currentPhotos.findIndex(photo => photo.id === active.id);
      const newIndex = currentPhotos.findIndex(photo => photo.id === over.id);
      
      const actualOldIndex = startIndex + oldIndex;
      const actualNewIndex = startIndex + newIndex;
      
      onMove(actualOldIndex, actualNewIndex);
    }
  };

  const handleMoveUp = (index: number) => {
    const actualIndex = startIndex + index;
    if (actualIndex > 0) {
      onMove(actualIndex, actualIndex - 1);
    }
  };

  const handleMoveDown = (index: number) => {
    const actualIndex = startIndex + index;
    if (actualIndex < photos.length - 1) {
      onMove(actualIndex, actualIndex + 1);
    }
  };

  const handleFeaturedToggle = (imageUrl: string) => {
    if (disabled) return;
    
    if (featuredPhotos.includes(imageUrl)) {
      onFeaturedPhotosChange(featuredPhotos.filter(url => url !== imageUrl));
    } else if (featuredPhotos.length < 10) {
      onFeaturedPhotosChange([...featuredPhotos, imageUrl]);
    }
  };

  if (photos.length === 0) return null;

  const canAddMoreFeatured = featuredPhotos.length < 10;

  return (
    <div className="space-y-4">
      <PhotoGridHeader 
        photoCount={photos.length} 
        featuredCount={featuredPhotos.length} 
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={currentPhotos.map(photo => photo.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {currentPhotos.map((photo, index) => {
              const actualIndex = startIndex + index;
              const isSelected = selectedCoverIndex === actualIndex;
              const isFeatured = featuredPhotos.includes(photo.url);
              
              return (
                <DraggablePhotoItem
                  key={photo.id}
                  photo={photo}
                  index={actualIndex}
                  isSelected={isSelected}
                  isFeatured={isFeatured}
                  onCoverSelect={onCoverSelect}
                  onFeaturedToggle={handleFeaturedToggle}
                  onRemove={onRemove}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  disabled={disabled}
                  totalPhotos={photos.length}
                  canAddMoreFeatured={canAddMoreFeatured}
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

      <PhotoGridInstructions featuredCount={featuredPhotos.length} />

      <PhotoGridPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPrevPage={handlePrevPage}
        onNextPage={handleNextPage}
        disabled={disabled}
      />
    </div>
  );
};

export default PaginatedPhotoGrid;
