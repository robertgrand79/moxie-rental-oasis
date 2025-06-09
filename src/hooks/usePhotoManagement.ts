
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

  const movePhoto = useCallback((fromIndex: number, toIndex: number) => {
    // For now, just handle cover selection updates
    // This can be expanded if needed for actual reordering
  }, []);

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
    movePhoto
  };
};
