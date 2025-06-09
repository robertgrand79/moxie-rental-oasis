
import { useState, useMemo } from 'react';

interface Photo {
  id: string;
  url: string;
  isExisting: boolean;
}

export const usePhotoPagination = (photos: Photo[], itemsPerPage: number = 12) => {
  const [currentPage, setCurrentPage] = useState(0);
  
  const totalPages = Math.ceil(photos.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, photos.length);
  
  const currentPhotos = useMemo(() => 
    photos.slice(startIndex, endIndex), 
    [photos, startIndex, endIndex]
  );

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages - 1, prev + 1));
  };

  return {
    currentPage,
    totalPages,
    startIndex,
    currentPhotos,
    handlePrevPage,
    handleNextPage
  };
};
