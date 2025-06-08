
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { FormLabel } from '@/components/ui/form';
import { Upload, X, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

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
    
    const updatedPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(updatedPhotos);
    
    setPreviewUrls(prev => {
      const newUrls = prev.filter((_, i) => i !== index);
      // Revoke the removed URL to prevent memory leaks
      if (prev[index]) {
        URL.revokeObjectURL(prev[index]);
      }
      return newUrls;
    });
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length > 0) {
      addPhotos(imageFiles);
    }
  };

  const allImages = [...existingImages, ...previewUrls];
  const totalImageCount = allImages.length;

  return (
    <div className="space-y-4">
      <FormLabel>Property Photos</FormLabel>
      
      {/* Existing Images Gallery */}
      {totalImageCount > 0 && (
        <div className="space-y-2">
          <FormLabel className="text-sm font-medium">
            All Property Images ({totalImageCount}) - Click to select cover photo
          </FormLabel>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {allImages.map((url, index) => (
              <div key={index} className="relative group">
                <div 
                  className={cn(
                    "relative cursor-pointer border-2 rounded-lg overflow-hidden transition-all",
                    selectedCoverIndex === index 
                      ? "border-primary ring-2 ring-primary/50" 
                      : "border-gray-200 hover:border-primary/50",
                    disabled && "opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => !disabled && onCoverSelect?.(index)}
                >
                  <img
                    src={url}
                    alt={`Property image ${index + 1}`}
                    className="w-full h-24 object-cover"
                  />
                  {selectedCoverIndex === index && (
                    <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                      <Star className="h-6 w-6 text-primary fill-current" />
                    </div>
                  )}
                  <div className="absolute top-1 left-1 bg-black/70 text-white text-xs px-1 rounded">
                    {selectedCoverIndex === index ? 'Cover' : index + 1}
                  </div>
                </div>
                {/* Only show remove button for new uploads (preview URLs) and when not disabled */}
                {index >= existingImages.length && !disabled && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      removePhoto(index - existingImages.length);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            The starred image will be used as the cover photo
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
