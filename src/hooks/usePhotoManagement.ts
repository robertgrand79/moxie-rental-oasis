
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
  const [deletedExistingImages, setDeletedExistingImages] = useState<string[]>([]);

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
    } else {
      // Mark existing image for deletion
      const imageToDelete = existingImages[index];
      setDeletedExistingImages(prev => [...prev, imageToDelete]);
    }
  }, [existingImages, photos, onPhotosChange]);

  const movePhotoToFirst = useCallback((fromIndex: number) => {
    // Get all photo URLs in the correct order (excluding deleted ones)
    const activeExistingImages = existingImages.filter(img => !deletedExistingImages.includes(img));
    const allPhotoUrls = [...activeExistingImages, ...previewUrls];
    
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
        const wasExisting = originalIndex < activeExistingImages.length;
        
        if (wasExisting) {
          newExistingImages.push(url);
        } else {
          const photoIndex = originalIndex - activeExistingImages.length;
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
    
    return activeExistingImages;
  }, [existingImages, deletedExistingImages, previewUrls, photos, onPhotosChange]);

  const movePhoto = useCallback((fromIndex: number, toIndex: number) => {
    const activeExisting = existingImages.filter(img => !deletedExistingImages.includes(img));
    const allUrls = [...activeExisting, ...previewUrls];
    
    // Reorder
    const [moved] = allUrls.splice(fromIndex, 1);
    allUrls.splice(toIndex, 0, moved);
    
    // Split back
    const newExisting: string[] = [];
    const newPreviewUrls: string[] = [];
    const newPhotos: File[] = [];
    
    allUrls.forEach((url) => {
      const origExistingIdx = activeExisting.indexOf(url);
      if (origExistingIdx !== -1 && !newExisting.includes(url)) {
        newExisting.push(url);
      } else {
        const previewIdx = previewUrls.indexOf(url);
        if (previewIdx !== -1 && photos[previewIdx]) {
          newPhotos.push(photos[previewIdx]);
          newPreviewUrls.push(url);
        }
      }
    });
    
    onPhotosChange(newPhotos);
    setPreviewUrls(newPreviewUrls);
  }, [existingImages, deletedExistingImages, previewUrls, photos, onPhotosChange]);

  // Combine existing images (excluding deleted ones) and new photos for display
  const activeExistingImages = existingImages.filter(img => !deletedExistingImages.includes(img));
  const allPhotos: Photo[] = [
    ...activeExistingImages.map((url, index) => ({
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
    movePhoto,
    movePhotoToFirst,
    deletedExistingImages
  };
};
