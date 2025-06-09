
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import OptimizedImage from '@/components/ui/optimized-image';

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

  const handleMove = (fromIndex: number, toIndex: number) => {
    const actualFromIndex = startIndex + fromIndex;
    const actualToIndex = startIndex + toIndex;
    onMove(actualFromIndex, actualToIndex);
  };

  if (photos.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Photo Grid */}
      <SortableContext 
        items={currentPhotos.map((_, index) => `photo-${startIndex + index}`)}
        strategy={verticalListSortingStrategy}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {currentPhotos.map((photo, index) => {
            const actualIndex = startIndex + index;
            const isSelected = selectedCoverIndex === actualIndex;
            
            return (
              <div
                key={`photo-${actualIndex}`}
                className="relative group cursor-pointer border-2 rounded-lg overflow-hidden transition-all hover:shadow-md"
                style={{
                  borderColor: isSelected ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                }}
                onClick={() => !disabled && onCoverSelect(actualIndex)}
              >
                <OptimizedImage
                  src={photo.url}
                  alt={`Property image ${actualIndex + 1}`}
                  width={200}
                  height={150}
                  className="w-full h-24 object-cover"
                />
                
                {/* Cover indicator */}
                <div className="absolute top-1 left-1 bg-black/70 text-white text-xs px-1 rounded">
                  {isSelected ? 'Cover' : actualIndex + 1}
                </div>

                {/* Remove button for new uploads */}
                {!photo.isExisting && !disabled && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(actualIndex);
                    }}
                  >
                    ×
                  </Button>
                )}

                {/* Selection overlay */}
                {isSelected && (
                  <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                    <div className="bg-primary text-primary-foreground rounded-full p-1">
                      ★
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </SortableContext>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button
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
