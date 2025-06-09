
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import DraggablePhotoItem from './DraggablePhotoItem';

interface Photo {
  id: string;
  url: string;
  isExisting: boolean;
}

interface PaginatedPhotoGridProps {
  photos: Photo[];
  selectedCoverIndex?: number;
  onCoverSelect: (index: number) => void;
  onRemove: (index: number) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
  disabled?: boolean;
  itemsPerPage?: number;
}

const ITEMS_PER_PAGE = 12;

const PaginatedPhotoGrid = ({
  photos,
  selectedCoverIndex,
  onCoverSelect,
  onRemove,
  onMove,
  disabled = false,
  itemsPerPage = ITEMS_PER_PAGE
}: PaginatedPhotoGridProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const totalPages = Math.ceil(photos.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, photos.length);
  const currentPhotos = photos.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
  };

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

  if (photos.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Photo Grid */}
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
              
              return (
                <DraggablePhotoItem
                  key={photo.id}
                  photo={photo}
                  index={actualIndex}
                  isSelected={isSelected}
                  onCoverSelect={onCoverSelect}
                  onRemove={onRemove}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  disabled={disabled}
                  totalPhotos={photos.length}
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={currentPage === 0 || disabled}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          
          <span className="text-sm text-muted-foreground">
            Page {currentPage + 1} of {totalPages} ({photos.length} photos)
          </span>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages - 1 || disabled}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default PaginatedPhotoGrid;
