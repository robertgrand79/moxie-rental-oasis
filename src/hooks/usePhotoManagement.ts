
import { useState, useCallback } from 'react';

interface Photo {
  id: string;
  url: string;
  isExisting: boolean;
}

export const usePhotoManagement = (
  photos: File[],
  onPhotosChange: (photos: File[]) => void,
  existingImages: string[] = []
) => {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const addPhotos = useCallback((newFiles: File[]) => {
    const updatedPhotos = [...photos, ...newFiles];
    onPhotosChange(updatedPhotos);
    
    // Create preview URLs
    newFiles.forEach(file => {
      const url = URL.createObjectURL(file);
      setPreviewUrls(prev => [...prev, url]);
    });
  }, [photos, onPhotosChange]);

  const removePhoto = useCallback((index: number) => {
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
  }, [existingImages.length, photos, onPhotosChange]);

  const movePhotoToFirst = useCallback((fromIndex: number) => {
    // Get all photo URLs in the correct order
    const allPhotoUrls = [...existingImages, ...previewUrls];
    
    if (fromIndex >= 0 && fromIndex < allPhotoUrls.length) {
      // Create new ordered arrays
      const photoToMove = allPhotoUrls[fromIndex];
      const reorderedUrls = [photoToMove, ...allPhotoUrls.filter((_, i) => i !== fromIndex)];
      
      // Split back into existing and new photos
      const newExistingImages: string[] = [];
      const newPreviewUrls: string[] = [];
      const newPhotos: File[] = [];
      
      reorderedUrls.forEach((url, index) => {
        const originalIndex = allPhotoUrls.indexOf(url);
        const wasExisting = originalIndex < existingImages.length;
        
        if (wasExisting) {
          newExistingImages.push(url);
        } else {
          const photoIndex = originalIndex - existingImages.length;
          if (photos[photoIndex]) {
            newPhotos.push(photos[photoIndex]);
            newPreviewUrls.push(url);
          }
        }
      });
      
      // Update the states
      onPhotosChange(newPhotos);
      setPreviewUrls(newPreviewUrls);
      
      // Return the new existing images order for parent component to handle
      return newExistingImages;
    }
    
    return existingImages;
  }, [existingImages, previewUrls, photos, onPhotosChange]);

  // Combine existing images and new photos for display
  const allPhotos: Photo[] = [
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

  return {
    allPhotos,
    addPhotos,
    removePhoto,
    movePhotoToFirst
  };
};
