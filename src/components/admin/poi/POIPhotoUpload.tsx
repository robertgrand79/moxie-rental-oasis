import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { usePOIPhotoUpload } from '@/hooks/usePOIPhotoUpload';
import { PointOfInterest } from '@/hooks/usePointsOfInterest';

interface POIPhotoUploadProps {
  poi: PointOfInterest;
  onPhotoUpdate: (poiId: string, imageUrl: string) => void;
  className?: string;
}

const POIPhotoUpload = ({ poi, onPhotoUpdate, className = '' }: POIPhotoUploadProps) => {
  const { uploadPhoto, deletePhoto, uploading, uploadProgress } = usePOIPhotoUpload();
  
  const progress = uploadProgress[poi.id] || 0;

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    const imageUrl = await uploadPhoto(file, poi.id);
    
    if (imageUrl) {
      onPhotoUpdate(poi.id, imageUrl);
    }
  }, [poi.id, uploadPhoto, onPhotoUpdate]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    maxFiles: 1,
    disabled: uploading
  });

  const handleRemovePhoto = async () => {
    if (poi.image_url) {
      const success = await deletePhoto(poi.image_url);
      if (success) {
        onPhotoUpdate(poi.id, '');
      }
    }
  };

  return (
    <div className={`relative ${className}`}>
      {poi.image_url && !uploading ? (
        <div className="relative group">
          <img
            src={poi.image_url}
            alt={poi.name}
            className="w-full h-32 object-cover rounded-lg"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRemovePhoto}
              className="absolute top-2 right-2"
            >
              <X className="h-4 w-4" />
            </Button>
            <div
              {...getRootProps()}
              className="absolute inset-0 cursor-pointer flex items-center justify-center"
            >
              <input {...getInputProps()} />
              <div className="text-center text-white">
                <Upload className="h-6 w-6 mx-auto mb-1" />
                <span className="text-xs">Replace</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`w-full h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-muted-foreground/50'
          } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
        >
          <input {...getInputProps()} />
          {uploading ? (
            <div className="text-center space-y-2 w-full px-4">
              <Upload className="h-6 w-6 mx-auto text-muted-foreground animate-pulse" />
              <Progress value={progress} className="w-full" />
              <span className="text-xs text-muted-foreground">{Math.round(progress)}%</span>
            </div>
          ) : (
            <div className="text-center space-y-1">
              <ImageIcon className="h-6 w-6 mx-auto text-muted-foreground" />
              <div className="text-xs text-muted-foreground px-2">
                {isDragActive ? 'Drop image here' : 'Drop image or click to upload'}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default POIPhotoUpload;