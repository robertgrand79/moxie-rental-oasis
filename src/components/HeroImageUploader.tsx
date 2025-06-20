
import React from 'react';
import { useHeroImageUploadHandlers } from '@/hooks/useHeroImageUploadHandlers';
import HeroImageLabel from '@/components/hero-image/HeroImageLabel';
import HeroImageDropzone from '@/components/hero-image/HeroImageDropzone';
import HeroImagePreview from '@/components/hero-image/HeroImagePreview';
import HeroImageLoadingState from '@/components/hero-image/HeroImageLoadingState';

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
  const {
    dragActive,
    isUploading,
    handleDrag,
    handleDrop,
    handleFileChange,
    removeImage
  } = useHeroImageUploadHandlers(onImageChange);

  const handleRemove = () => removeImage(currentImageUrl);

  return (
    <div>
      <HeroImageLabel 
        isUploading={isUploading} 
        hasImage={!!currentImageUrl} 
      />

      <div
        className={`mt-1 ${
          currentImageUrl ? 'border-green-500' : ''
        }`}
      >
        {currentImageUrl && !isUploading ? (
          <HeroImagePreview
            imageUrl={currentImageUrl}
            isUploading={isUploading}
            onRemove={handleRemove}
          />
        ) : isUploading ? (
          <HeroImageLoadingState />
        ) : (
          <HeroImageDropzone
            dragActive={dragActive}
            isUploading={isUploading}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onFileChange={handleFileChange}
          />
        )}
      </div>
    </div>
  );
};

export default HeroImageUploader;
