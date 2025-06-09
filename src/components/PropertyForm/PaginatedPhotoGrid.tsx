
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Star, Heart } from 'lucide-react';
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
  featuredPhotos?: string[];
  onCoverSelect: (index: number) => void;
  onFeaturedPhotosChange: (photos: string[]) => void;
  onRemove: (index: number) => void;
  onMove: (fromIndex: number, toIndex: number) => void;
  disabled?: boolean;
  itemsPerPage?: number;
}

const ITEMS_PER_PAGE = 12;

const PaginatedPhotoGrid = ({
  photos,
  selectedCoverIndex,
  featuredPhotos = [],
  onCoverSelect,
  onFeaturedPhotosChange,
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

  const handleFeaturedToggle = (imageUrl: string) => {
    if (disabled) return;
    
    if (featuredPhotos.includes(imageUrl)) {
      // Remove from featured
      onFeaturedPhotosChange(featuredPhotos.filter(url => url !== imageUrl));
    } else if (featuredPhotos.length < 10) {
      // Add to featured (max 10)
      onFeaturedPhotosChange([...featuredPhotos, imageUrl]);
    }
  };

  if (photos.length === 0) return null;

  const canAddMoreFeatured = featuredPhotos.length < 10;

  return (
    <div className="space-y-4">
      {/* Header with indicators */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold">Photo Gallery ({photos.length} photos)</h3>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              Cover Photo
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              Featured: {featuredPhotos.length}/10
            </Badge>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Hover photos to select cover and featured images
        </p>
      </div>

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

      {/* Instructions */}
      <div className="text-center space-y-2">
        <p className="text-xs text-muted-foreground">
          The starred image will be used as the cover photo for your property listing.
        </p>
        <p className="text-xs text-muted-foreground">
          Featured photos (♥) will be displayed in the property page gallery (max 10).
        </p>
        {featuredPhotos.length === 10 && (
          <p className="text-xs text-amber-600">
            Maximum of 10 featured photos selected. Remove a photo to choose a different one.
          </p>
        )}
      </div>

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
            Page {currentPage + 1} of {totalPages}
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
