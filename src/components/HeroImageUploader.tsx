
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, Loader2, AlertCircle, CheckCircle, Image } from 'lucide-react';
import { useHeroImageUpload } from '@/hooks/useHeroImageUpload';
import { useSimplifiedSiteSettings } from '@/hooks/useSimplifiedSiteSettings';
import { toast } from '@/hooks/use-toast';

interface HeroImageUploaderProps {
  currentImageUrl: string | null;
  onImageChange: (imageUrl: string | null) => void;
  hasUnsavedChanges?: boolean;
}

const HeroImageUploader = ({ 
  currentImageUrl, 
  onImageChange, 
  hasUnsavedChanges = false 
}: HeroImageUploaderProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { uploadHeroImage, deleteHeroImage } = useHeroImageUpload();
  const { saveSetting } = useSimplifiedSiteSettings();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file (JPEG, PNG, WebP, or GIF).',
        variant: 'destructive'
      });
      return;
    }

    setIsUploading(true);
    console.log('[Hero Image] Starting upload process for:', file.name);

    try {
      // Upload the image to storage
      const uploadedUrl = await uploadHeroImage(file);
      
      if (uploadedUrl) {
        console.log('[Hero Image] Upload successful, saving to database:', uploadedUrl);
        
        // Save the URL to the database immediately
        const saveSuccess = await saveSetting('heroBackgroundImage', uploadedUrl);
        
        if (saveSuccess) {
          console.log('[Hero Image] Database save successful');
          // Notify parent component of the change
          onImageChange(uploadedUrl);
          
          toast({
            title: 'Hero image updated',
            description: 'Your hero background image has been successfully updated.',
          });
        } else {
          console.error('[Hero Image] Database save failed');
          toast({
            title: 'Save error',
            description: 'Image uploaded but failed to save to database. Please try again.',
            variant: 'destructive'
          });
        }
      } else {
        console.error('[Hero Image] Upload failed');
      }
    } catch (error) {
      console.error('[Hero Image] Upload process failed:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload hero image. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFileSelect(file);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleFileSelect(file);
    }
    // Reset the input
    e.target.value = '';
  };

  const removeImage = async () => {
    console.log('[Hero Image] Removing hero image');
    setIsUploading(true);
    
    try {
      // If there's a current image, try to delete it from storage
      if (currentImageUrl) {
        await deleteHeroImage(currentImageUrl);
      }
      
      // Save empty string to database
      const saveSuccess = await saveSetting('heroBackgroundImage', '');
      
      if (saveSuccess) {
        console.log('[Hero Image] Image removal successful');
        onImageChange(null);
        
        toast({
          title: 'Hero image removed',
          description: 'Your hero background image has been removed.',
        });
      } else {
        toast({
          title: 'Remove error',
          description: 'Failed to remove hero image. Please try again.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('[Hero Image] Remove process failed:', error);
      toast({
        title: 'Remove failed',
        description: 'Failed to remove hero image. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <Label className="flex items-center gap-2">
        Hero Background Image
        {isUploading && (
          <div className="flex items-center gap-1 text-blue-600">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span className="text-xs">Uploading...</span>
          </div>
        )}
        {currentImageUrl && !isUploading && (
          <div className="flex items-center gap-1 text-green-600">
            <CheckCircle className="h-3 w-3" />
            <span className="text-xs">Saved</span>
          </div>
        )}
      </Label>

      <div
        className={`mt-1 border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        } ${currentImageUrl ? 'border-green-500' : ''} ${isUploading ? 'opacity-75' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {currentImageUrl && !isUploading ? (
          <div className="relative">
            <img
              src={currentImageUrl}
              alt="Hero background preview"
              className="w-full h-40 object-cover rounded-md"
              onError={(e) => {
                console.error('Image failed to load:', currentImageUrl);
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={removeImage}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="mt-2 text-xs text-gray-500">
              <p>
                Click the X to remove, or drag a new image to replace
              </p>
            </div>
          </div>
        ) : isUploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-2" />
            <p className="text-sm text-blue-600 font-medium">
              Uploading and saving your hero image...
            </p>
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
                disabled={isUploading}
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
