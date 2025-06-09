
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
  disabled = false
}: PhotoUploadSectionProps) => {
  const { allPhotos, addPhotos, removePhoto, movePhoto } = usePhotoManagement(
    photos,
    onPhotosChange,
    existingImages
  );

  const handleMovePhoto = (fromIndex: number, toIndex: number) => {
    if (disabled) return;
    
    // For now, just update cover selection based on the move
    if (selectedCoverIndex === fromIndex) {
      onCoverSelect?.(toIndex);
    } else if (selectedCoverIndex === toIndex) {
      onCoverSelect?.(fromIndex);
    }
    
    movePhoto(fromIndex, toIndex);
  };

  return (
    <div className="space-y-8">
      <FormLabel className="text-lg font-semibold">Property Photos</FormLabel>
      
      {/* Unified Photo Gallery with Cover and Featured Selection */}
      {allPhotos.length > 0 && (
        <div className="space-y-4">
          <PaginatedPhotoGrid
            photos={allPhotos}
            selectedCoverIndex={selectedCoverIndex}
            featuredPhotos={featuredPhotos}
            onCoverSelect={(index) => !disabled && onCoverSelect?.(index)}
            onFeaturedPhotosChange={(photos) => !disabled && onFeaturedPhotosChange?.(photos)}
            onRemove={removePhoto}
            onMove={handleMovePhoto}
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
