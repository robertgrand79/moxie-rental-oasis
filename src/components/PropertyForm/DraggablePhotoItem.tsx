
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

      {/* Indicators */}
      <PhotoIndicators 
        isSelected={isSelected}
        isFeatured={isFeatured}
        index={index}
      />

      {/* Action buttons overlay */}
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

      {/* Controls */}
      <PhotoControls
        photo={photo}
        index={index}
        totalPhotos={totalPhotos}
        disabled={disabled}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onRemove={onRemove}
      />

      {/* Overlays */}
      <PhotoOverlays
        isSelected={isSelected}
        isFeatured={isFeatured}
      />
    </div>
  );
};

export default DraggablePhotoItem;
