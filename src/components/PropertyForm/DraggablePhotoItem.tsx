
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { GripVertical, Star, X, ChevronUp, ChevronDown, Heart } from 'lucide-react';
import OptimizedImage from '@/components/ui/optimized-image';

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
  } = useSortable({ id: photo.id });

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
      } ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-border'}`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 bg-black/70 text-white p-1 rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <GripVertical className="h-4 w-4" />
      </div>

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

      {/* Cover indicator */}
      <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
        {isSelected && <Star className="h-3 w-3 fill-current text-yellow-400" />}
        {isSelected ? 'Cover' : index + 1}
      </div>

      {/* Featured indicator */}
      {isFeatured && (
        <div className="absolute top-2 right-14 bg-red-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
          <Heart className="h-3 w-3 fill-current" />
        </div>
      )}

      {/* Action buttons overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
        <div className="flex gap-2">
          {/* Cover photo button */}
          <Button
            type="button"
            variant={isSelected ? "default" : "secondary"}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              if (!disabled) onCoverSelect(index);
            }}
            disabled={disabled}
            title={isSelected ? "Cover photo" : "Set as cover"}
          >
            <Star className={`h-3 w-3 ${isSelected ? 'fill-current' : ''}`} />
          </Button>

          {/* Featured photo button */}
          <Button
            type="button"
            variant={isFeatured ? "default" : "secondary"}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              if (!disabled && (isFeatured || canAddMoreFeatured)) {
                onFeaturedToggle(photo.url);
              }
            }}
            disabled={disabled || (!isFeatured && !canAddMoreFeatured)}
            title={isFeatured ? "Remove from featured" : "Add to featured"}
          >
            <Heart className={`h-3 w-3 ${isFeatured ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-2 left-2 right-2 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Move buttons */}
        <div className="flex gap-1">
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp(index);
            }}
            disabled={disabled || index === 0}
          >
            <ChevronUp className="h-3 w-3" />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown(index);
            }}
            disabled={disabled || index === totalPhotos - 1}
          >
            <ChevronDown className="h-3 w-3" />
          </Button>
        </div>

        {/* Remove button for new uploads */}
        {!photo.isExisting && !disabled && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(index);
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Selection overlay */}
      {isSelected && (
        <div className="absolute inset-0 bg-primary/10 flex items-center justify-center pointer-events-none">
          <div className="bg-primary text-primary-foreground rounded-full p-2">
            <Star className="h-4 w-4 fill-current" />
          </div>
        </div>
      )}

      {/* Featured overlay */}
      {isFeatured && !isSelected && (
        <div className="absolute inset-0 bg-red-500/10 pointer-events-none" />
      )}
    </div>
  );
};

export default DraggablePhotoItem;
