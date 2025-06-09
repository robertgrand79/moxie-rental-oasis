
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhotoDropzoneProps {
  onPhotosAdded: (files: File[]) => void;
  disabled?: boolean;
}

const PhotoDropzone = ({ onPhotosAdded, disabled = false }: PhotoDropzoneProps) => {
  const [dragActive, setDragActive] = useState(false);

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
      onPhotosAdded(imageFiles);
    }
  }, [disabled, onPhotosAdded]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length > 0) {
      onPhotosAdded(imageFiles);
    }
  };

  return (
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
  );
};

export default PhotoDropzone;
