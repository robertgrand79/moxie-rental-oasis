
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
  deletedImages?: string[];
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
  deletedImages = [],
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
    
    // Only allow selection of actual storage URLs, not blob URLs
    if (imageUrl.startsWith('blob:')) {
      console.warn('Cannot select blob URL as featured photo:', imageUrl);
      return;
    }
    
    // Filter out blob URLs from current featured photos
    const validFeaturedPhotos = featuredPhotos.filter(url => !url.startsWith('blob:'));
    
    if (validFeaturedPhotos.includes(imageUrl)) {
      onFeaturedPhotosChange(validFeaturedPhotos.filter(url => url !== imageUrl));
    } else if (validFeaturedPhotos.length < 10) {
      onFeaturedPhotosChange([...validFeaturedPhotos, imageUrl]);
    }
  };

  if (photos.length === 0) return null;

  // Only count valid storage URLs, not blob URLs
  const validFeaturedPhotos = featuredPhotos.filter(url => !url.startsWith('blob:'));
  const canAddMoreFeatured = validFeaturedPhotos.length < 10;

  return (
    <div className="space-y-4">
      <PhotoGridHeader 
        photoCount={photos.length} 
        featuredCount={validFeaturedPhotos.length}
        deletedCount={deletedImages.length}
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
              const isFeatured = validFeaturedPhotos.includes(photo.url);
              const isMarkedForDeletion = photo.isExisting && deletedImages.includes(photo.url);
              
              return (
                <DraggablePhotoItem
                  key={photo.id}
                  photo={photo}
                  index={actualIndex}
                  isSelected={isSelected}
                  isFeatured={isFeatured}
                  isMarkedForDeletion={isMarkedForDeletion}
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

      <PhotoGridInstructions 
        featuredCount={validFeaturedPhotos.length} 
        deletedCount={deletedImages.length}
      />

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
