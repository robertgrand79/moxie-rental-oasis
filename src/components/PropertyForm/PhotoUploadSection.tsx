
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { FormLabel } from '@/components/ui/form';
import { Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhotoUploadSectionProps {
  photos: File[];
  onPhotosChange: (photos: File[]) => void;
  isEditing?: boolean;
  existingImageUrl?: string;
}

const PhotoUploadSection = ({ photos, onPhotosChange, isEditing, existingImageUrl }: PhotoUploadSectionProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      addPhotos(imageFiles);
    }
  }, []);

  const addPhotos = (newFiles: File[]) => {
    const updatedPhotos = [...photos, ...newFiles];
    onPhotosChange(updatedPhotos);
    
    // Create preview URLs
    newFiles.forEach(file => {
      const url = URL.createObjectURL(file);
      setPreviewUrls(prev => [...prev, url]);
    });
  };

  const removePhoto = (index: number) => {
    const updatedPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(updatedPhotos);
    
    setPreviewUrls(prev => {
      const newUrls = prev.filter((_, i) => i !== index);
      // Revoke the removed URL to prevent memory leaks
      URL.revokeObjectURL(prev[index]);
      return newUrls;
    });
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length > 0) {
      addPhotos(imageFiles);
    }
  };

  return (
    <div className="space-y-4">
      {/* Photo Upload Section - only show if not editing or if no existing image */}
      {(!isEditing || !existingImageUrl) && (
        <>
          <FormLabel>Property Photos</FormLabel>
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
              "hover:border-primary hover:bg-primary/5"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <div className="space-y-2">
              <p className="text-sm font-medium">Drag and drop photos here</p>
              <p className="text-xs text-muted-foreground">or click to select files</p>
              <input
                type="file"
                multiple
                accept="image/*"
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
            </div>
          </div>
          
          {/* Photo Previews */}
          {previewUrls.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removePhoto(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Show existing image if editing */}
      {isEditing && existingImageUrl && (
        <div className="space-y-2">
          <FormLabel>Current Property Image</FormLabel>
          <div className="relative w-48 h-32">
            <img
              src={existingImageUrl}
              alt="Current property"
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Upload new photos above to replace the current image
          </p>
        </div>
      )}
    </div>
  );
};

export default PhotoUploadSection;
