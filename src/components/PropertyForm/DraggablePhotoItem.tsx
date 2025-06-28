import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import ThumbnailImage from '@/components/ui/thumbnail-image';
import PhotoActionButtons from './PhotoActionButtons';
import PhotoIndicators from './PhotoIndicators';
import PhotoControls from './PhotoControls';
import PhotoOverlays from './PhotoOverlays';
import PhotoDeleteConfirmDialog from './PhotoDeleteConfirmDialog';

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
  isMarkedForDeletion?: boolean;
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
  isMarkedForDeletion = false,
  onCoverSelect,
  onFeaturedToggle,
  onRemove,
  onMoveUp,
  onMoveDown,
  disabled = false,
  totalPhotos,
  canAddMoreFeatured
}: DraggablePhotoItemProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo.id, disabled: true });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDeleteClick = () => {
    if (photo.isExisting) {
      setShowDeleteDialog(true);
    } else {
      onRemove(index);
    }
  };

  const handleConfirmDelete = () => {
    onRemove(index);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={`relative group border-2 rounded-lg overflow-hidden transition-all ${
          isDragging ? 'opacity-50 scale-105 shadow-lg' : 'hover:shadow-md'
        } ${isSelected ? 'border-primary ring-2 ring-primary/20 ring-offset-2' : 'border-border'} ${
          isMarkedForDeletion ? 'opacity-50 grayscale' : ''
        }`}
      >
        {/* Cover Photo Badge */}
        {index === 0 && !isMarkedForDeletion && (
          <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-md font-medium z-20">
            Cover Photo
          </div>
        )}

        {/* Marked for Deletion Badge */}
        {isMarkedForDeletion && (
          <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs px-2 py-1 rounded-md font-medium z-20">
            Marked for Deletion
          </div>
        )}

        {/* Photo */}
        <div className="cursor-pointer">
          <ThumbnailImage
            src={photo.url}
            alt={`Property image ${index + 1}`}
            className="w-full h-32"
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

        {/* Delete button - positioned separately with higher z-index */}
        {!disabled && !isMarkedForDeletion && (
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-30">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick();
              }}
              className="bg-destructive text-destructive-foreground p-1.5 rounded hover:bg-destructive/90 transition-colors"
              title={photo.isExisting ? "Delete photo" : "Remove photo"}
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Action buttons overlay - highest z-index to ensure clickability */}
        {!isMarkedForDeletion && (
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
        )}
      </div>

      <PhotoDeleteConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        photoIndex={index}
      />
    </>
  );
};

export default DraggablePhotoItem;
