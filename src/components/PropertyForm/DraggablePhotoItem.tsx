
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import OptimizedImage from '@/components/ui/optimized-image';
import PhotoActionButtons from './PhotoActionButtons';
import PhotoIndicators from './PhotoIndicators';
import PhotoControls from './PhotoControls';
import PhotoOverlays from './PhotoOverlays';

interface Photo {
  id: string;
  url: string;
  isExisting: boolean;
}

interface DraggablePhotoItemProps {
  photo: Photo;
  index: number;
  isSelected: boolean;
  isFeatured: boolean;
  onCoverSelect: (index: number) => void;
  onFeaturedToggle: (imageUrl: string) => void;
  onRemove: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  disabled?: boolean;
  totalPhotos: number;
  canAddMoreFeatured: boolean;
}

const DraggablePhotoItem = ({
  photo,
  index,
  isSelected,
  isFeatured,
  onCoverSelect,
  onFeaturedToggle,
  onRemove,
  onMoveUp,
  onMoveDown,
  disabled = false,
  totalPhotos,
  canAddMoreFeatured
}: DraggablePhotoItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo.id, disabled: true }); // Disable manual dragging since we auto-move

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group border-2 rounded-lg overflow-hidden transition-all ${
        isDragging ? 'opacity-50 scale-105 shadow-lg' : 'hover:shadow-md'
      } ${isSelected ? 'border-primary ring-2 ring-primary/20 ring-offset-2' : 'border-border'}`}
    >
      {/* Cover Photo Badge */}
      {index === 0 && (
        <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-md font-medium z-20">
          Cover Photo
        </div>
      )}

      {/* Photo */}
      <div className="cursor-pointer">
        <OptimizedImage
          src={photo.url}
          alt={`Property image ${index + 1}`}
          width={150}
          height={150}
          className="w-full h-32 object-cover"
        />
      </div>

      {/* Background overlays - lowest z-index */}
      <PhotoOverlays 
        isSelected={isSelected}
        isFeatured={isFeatured}
      />

      {/* Indicators - middle z-index */}
      <PhotoIndicators 
        isSelected={isSelected}
        isFeatured={isFeatured}
        index={index}
      />

      {/* Remove button for new photos only - positioned separately */}
      {!photo.isExisting && !disabled && (
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-30">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(index);
            }}
            className="bg-destructive text-destructive-foreground p-1 rounded text-xs hover:bg-destructive/90"
          >
            Remove
          </button>
        </div>
      )}

      {/* Action buttons overlay - highest z-index to ensure clickability */}
      <PhotoActionButtons
        isSelected={isSelected}
        isFeatured={isFeatured}
        canAddMoreFeatured={canAddMoreFeatured}
        disabled={disabled}
        index={index}
        photoUrl={photo.url}
        onCoverSelect={onCoverSelect}
        onFeaturedToggle={onFeaturedToggle}
      />
    </div>
  );
};

export default DraggablePhotoItem;
