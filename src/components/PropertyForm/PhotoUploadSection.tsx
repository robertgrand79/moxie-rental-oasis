
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { FormLabel } from '@/components/ui/form';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';
import PaginatedPhotoGrid from './PaginatedPhotoGrid';

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
    
    // For now, just update cover selection based on the move
    if (selectedCoverIndex === fromIndex) {
      onCoverSelect?.(toIndex);
    } else if (selectedCoverIndex === toIndex) {
      onCoverSelect?.(fromIndex);
    }
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
            onMove={movePhoto}
            disabled={disabled}
          />
        </div>
      )}

      {/* Photo Upload Area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300",
          dragActive && !disabled ? "border-primary bg-primary/5 scale-105" : "border-muted-foreground/25",
          !disabled && "hover:border-primary hover:bg-primary/5 cursor-pointer",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
        <div className="space-y-4">
          <div>
            <p className="text-lg font-medium">
              {disabled ? 'Upload in progress...' : 'Add more photos'}
            </p>
            <p className="text-sm text-muted-foreground">
              {disabled ? 'Please wait while photos are being processed' : 'Drag and drop or click to select files (JPEG, PNG, WebP, GIF)'}
            </p>
          </div>
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
                size="lg"
                onClick={() => document.getElementById('photo-upload')?.click()}
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
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
