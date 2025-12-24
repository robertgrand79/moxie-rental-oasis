
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, AlertTriangle, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { validatePhotoFiles, formatFileSize } from '@/utils/photoValidation';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PhotoDropzoneProps {
  onPhotosAdded: (files: File[]) => void;
  disabled?: boolean;
  existingCount?: number;
  maxFiles?: number;
  maxSizeMB?: number;
}

const PhotoDropzone = ({ 
  onPhotosAdded, 
  disabled = false,
  existingCount = 0,
  maxFiles = 50,
  maxSizeMB = 15
}: PhotoDropzoneProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const { toast } = useToast();

  const processFiles = useCallback(async (files: File[]) => {
    // Filter to only image files first
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      toast({
        title: "No valid images",
        description: "Please select image files (JPEG, PNG, WebP, GIF)",
        variant: "destructive"
      });
      return;
    }

    // Validate all files
    const result = await validatePhotoFiles(imageFiles, existingCount, { maxFiles, maxSizeMB });
    
    if (!result.valid) {
      toast({
        title: "Upload Error",
        description: result.errors[0],
        variant: "destructive"
      });
      return;
    }

    // Show warnings if any
    if (result.warnings.length > 0) {
      setValidationWarnings(result.warnings);
      // Clear warnings after 5 seconds
      setTimeout(() => setValidationWarnings([]), 5000);
    }

    onPhotosAdded(imageFiles);
    
    toast({
      title: "Photos Added",
      description: `${imageFiles.length} photo(s) ready for upload`,
    });
  }, [existingCount, maxFiles, maxSizeMB, onPhotosAdded, toast]);

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
    processFiles(files);
  }, [disabled, processFiles]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const files = Array.from(e.target.files || []);
    processFiles(files);
    
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      {validationWarnings.length > 0 && (
        <Alert variant="default" className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-700 dark:text-yellow-400">
            <ul className="list-disc list-inside space-y-1">
              {validationWarnings.map((warning, i) => (
                <li key={i} className="text-sm">{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
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
              {disabled ? 'Please wait while photos are being processed' : 'Drag and drop or click to select files'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              JPEG, PNG, WebP, GIF • Max {maxSizeMB}MB per file • {existingCount}/{maxFiles} photos used
            </p>
          </div>
          {!disabled && (
            <>
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif"
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

export default PhotoDropzone;
