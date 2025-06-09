
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { FormLabel } from '@/components/ui/form';
import { Upload, X, Star, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import PaginatedPhotoGrid from './PaginatedPhotoGrid';

interface PhotoUploadSectionProps {
  photos: File[];
  onPhotosChange: (photos: File[]) => void;
  isEditing?: boolean;
  existingImages?: string[];
  selectedCoverIndex?: number;
  onCoverSelect?: (index: number) => void;
  disabled?: boolean;
}

const PhotoUploadSection = ({ 
  photos, 
  onPhotosChange, 
  isEditing, 
  existingImages = [], 
  selectedCoverIndex,
  onCoverSelect,
  disabled = false
}: PhotoUploadSectionProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    if (disabled) return;
    
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, [disabled]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    if (disabled) return;
    
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      addPhotos(imageFiles);
    }
  }, [disabled]);

  const addPhotos = (newFiles: File[]) => {
    if (disabled) return;
    
    const updatedPhotos = [...photos, ...newFiles];
    onPhotosChange(updatedPhotos);
    
    // Create preview URLs
    newFiles.forEach(file => {
      const url = URL.createObjectURL(file);
      setPreviewUrls(prev => [...prev, url]);
    });
  };

  const removePhoto = (index: number) => {
    if (disabled) return;
    
    const isNewPhoto = index >= existingImages.length;
    
    if (isNewPhoto) {
      const photoIndex = index - existingImages.length;
      const updatedPhotos = photos.filter((_, i) => i !== photoIndex);
      onPhotosChange(updatedPhotos);
      
      setPreviewUrls(prev => {
        const newUrls = prev.filter((_, i) => i !== photoIndex);
        if (prev[photoIndex]) {
          URL.revokeObjectURL(prev[photoIndex]);
        }
        return newUrls;
      });
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length > 0) {
      addPhotos(imageFiles);
    }
  };

  // Combine existing images and new photos for display
  const allPhotos = [
    ...existingImages.map((url, index) => ({
      id: `existing-${index}`,
      url,
      isExisting: true
    })),
    ...previewUrls.map((url, index) => ({
      id: `new-${index}`,
      url,
      isExisting: false
    }))
  ];

  const movePhoto = (fromIndex: number, toIndex: number) => {
    if (disabled) return;
    
    // Simple reordering logic - for now just update cover selection
    if (selectedCoverIndex === fromIndex) {
      onCoverSelect?.(toIndex);
    }
  };

  return (
    <div className="space-y-4">
      <FormLabel>Property Photos</FormLabel>
      
      {/* Photo Gallery */}
      {allPhotos.length > 0 && (
        <div className="space-y-2">
          <FormLabel className="text-sm font-medium">
            All Property Images ({allPhotos.length}) - Click to select cover photo
          </FormLabel>
          <PaginatedPhotoGrid
            photos={allPhotos}
            selectedCoverIndex={selectedCoverIndex}
            onCoverSelect={(index) => !disabled && onCoverSelect?.(index)}
            onRemove={removePhoto}
            onMove={movePhoto}
            disabled={disabled}
          />
          <p className="text-xs text-muted-foreground">
            The starred image will be used as the cover photo.
          </p>
        </div>
      )}

      {/* Photo Upload Area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          dragActive && !disabled ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          !disabled && "hover:border-primary hover:bg-primary/5",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <div className="space-y-2">
          <p className="text-sm font-medium">
            {disabled ? 'Upload in progress...' : 'Add more photos'}
          </p>
          <p className="text-xs text-muted-foreground">
            {disabled ? 'Please wait while photos are being processed' : 'Drag and drop or click to select files (JPEG, PNG, WebP, GIF)'}
          </p>
          {!disabled && (
            <>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFileInput}
                className="hidden"
                id="photo-upload"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('photo-upload')?.click()}
              >
                Choose Files
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoUploadSection;
