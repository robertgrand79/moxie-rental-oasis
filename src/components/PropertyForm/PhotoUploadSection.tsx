
import React from 'react';
import { FormLabel } from '@/components/ui/form';
import PaginatedPhotoGrid from './PaginatedPhotoGrid';
import PhotoDropzone from './PhotoDropzone';
import { usePhotoManagement } from '@/hooks/usePhotoManagement';

interface PhotoUploadSectionProps {
  photos: File[];
  onPhotosChange: (photos: File[]) => void;
  isEditing?: boolean;
  existingImages?: string[];
  selectedCoverIndex?: number;
  onCoverSelect?: (index: number) => void;
  featuredPhotos?: string[];
  onFeaturedPhotosChange?: (photos: string[]) => void;
  onExistingImagesReorder?: (newOrder: string[]) => void;
  disabled?: boolean;
}

const PhotoUploadSection = ({ 
  photos, 
  onPhotosChange, 
  isEditing, 
  existingImages = [], 
  selectedCoverIndex,
  onCoverSelect,
  featuredPhotos = [],
  onFeaturedPhotosChange,
  onExistingImagesReorder,
  disabled = false
}: PhotoUploadSectionProps) => {
  const { allPhotos, addPhotos, removePhoto, movePhotoToFirst } = usePhotoManagement(
    photos,
    onPhotosChange,
    existingImages
  );

  const handleCoverSelect = (index: number) => {
    if (disabled) return;
    
    // Move the selected photo to first position
    const newExistingOrder = movePhotoToFirst(index);
    
    // Update the existing images order in parent component
    if (onExistingImagesReorder) {
      onExistingImagesReorder(newExistingOrder);
    }
    
    // Set cover index to 0 since the photo is now first
    onCoverSelect?.(0);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <FormLabel className="text-lg font-semibold">Property Photos</FormLabel>
        <p className="text-sm text-muted-foreground">
          Click the star on any photo to make it the cover photo. It will automatically move to the first position.
        </p>
      </div>
      
      {/* Unified Photo Gallery with Cover and Featured Selection */}
      {allPhotos.length > 0 && (
        <div className="space-y-4">
          <PaginatedPhotoGrid
            photos={allPhotos}
            selectedCoverIndex={0} // Always use first photo as cover
            featuredPhotos={featuredPhotos}
            onCoverSelect={handleCoverSelect}
            onFeaturedPhotosChange={(photos) => !disabled && onFeaturedPhotosChange?.(photos)}
            onRemove={removePhoto}
            onMove={() => {}} // Disable manual reordering since we auto-move
            disabled={disabled}
          />
        </div>
      )}

      {/* Photo Upload Area */}
      <PhotoDropzone 
        onPhotosAdded={addPhotos}
        disabled={disabled}
      />
    </div>
  );
};

export default PhotoUploadSection;
