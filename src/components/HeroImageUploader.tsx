
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useHeroImageUpload } from '@/hooks/useHeroImageUpload';
import { toast } from '@/hooks/use-toast';

interface HeroImageUploaderProps {
  currentImageUrl: string | null;
  onImageChange: (imageUrl: string | null) => void;
  pendingImageUrl?: string | null;
  hasUnsavedChanges?: boolean;
}

const HeroImageUploader = ({ 
  currentImageUrl, 
  onImageChange, 
  pendingImageUrl,
  hasUnsavedChanges = false 
}: HeroImageUploaderProps) => {
  const [dragActive, setDragActive] = useState(false);
  const { uploadHeroImage, deleteHeroImage, uploading } = useHeroImageUpload();

  // Use pending image if available, otherwise use current
  const displayImageUrl = pendingImageUrl || currentImageUrl;

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        console.log('Uploading dropped file:', file.name, 'Size:', file.size);
        const uploadedUrl = await uploadHeroImage(file);
        console.log('Upload result:', uploadedUrl);
        
        if (uploadedUrl) {
          // Update local state immediately
          onImageChange(uploadedUrl);
          toast({
            title: 'Image Uploaded Successfully',
            description: 'Your hero image has been uploaded. Click "Save Hero Settings" to apply changes.',
            variant: 'default'
          });
        }
      } else {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload an image file (JPEG, PNG, WebP, or GIF).',
          variant: 'destructive'
        });
      }
    }
  }, [uploadHeroImage, onImageChange]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        console.log('Uploading selected file:', file.name, 'Size:', file.size);
        const uploadedUrl = await uploadHeroImage(file);
        console.log('Upload result:', uploadedUrl);
        
        if (uploadedUrl) {
          // Update local state immediately
          onImageChange(uploadedUrl);
          toast({
            title: 'Image Uploaded Successfully',
            description: 'Your hero image has been uploaded. Click "Save Hero Settings" to apply changes.',
            variant: 'default'
          });
        }
      } else {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload an image file (JPEG, PNG, WebP, or GIF).',
          variant: 'destructive'
        });
      }
    }
    // Reset the input
    e.target.value = '';
  };

  const removeImage = () => {
    console.log('Removing hero image');
    onImageChange(null);
    toast({
      title: 'Image Removed',
      description: 'Click "Save Hero Settings" to apply changes.',
    });
  };

  return (
    <div>
      <Label className="flex items-center gap-2">
        Hero Background Image
        {hasUnsavedChanges && (
          <div className="flex items-center gap-1 text-orange-600">
            <AlertCircle className="h-3 w-3" />
            <span className="text-xs">Unsaved changes</span>
          </div>
        )}
        {displayImageUrl && !hasUnsavedChanges && (
          <div className="flex items-center gap-1 text-green-600">
            <CheckCircle className="h-3 w-3" />
            <span className="text-xs">Saved</span>
          </div>
        )}
      </Label>
      <div
        className={`mt-1 border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        } ${displayImageUrl ? 'border-green-500' : ''} ${hasUnsavedChanges ? 'border-orange-500' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {uploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
            <p className="text-sm text-gray-600">Uploading image...</p>
            <p className="text-xs text-gray-500 mt-1">This may take a moment</p>
          </div>
        ) : displayImageUrl ? (
          <div className="relative">
            <img
              src={displayImageUrl}
              alt="Hero background preview"
              className="w-full h-40 object-cover rounded-md"
              onError={(e) => {
                console.error('Image failed to load:', displayImageUrl);
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
              onLoad={() => {
                console.log('Image loaded successfully:', displayImageUrl);
              }}
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={removeImage}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="mt-2 text-xs text-gray-500">
              {hasUnsavedChanges ? (
                <p className="text-orange-600 font-medium">
                  Changes pending - Click "Save Hero Settings" to apply
                </p>
              ) : (
                <p>
                  Click the X to remove, or drag a new image to replace
                </p>
              )}
            </div>
          </div>
        ) : (
          <>
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Drag and drop a hero image here, or
            </p>
            <label className="mt-2 cursor-pointer">
              <span className="text-blue-600 hover:text-blue-500">browse files</span>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </label>
            <p className="text-xs text-gray-500 mt-2">
              Recommended: 1920x1080 or larger. Max size: 50MB
            </p>
            <p className="text-xs text-gray-500">
              Supported formats: JPEG, PNG, WebP, GIF
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default HeroImageUploader;
