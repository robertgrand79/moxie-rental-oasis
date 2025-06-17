
import { useState, useEffect } from 'react';

interface ImageValidationResult {
  isValid: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useImageValidator = (imageUrl: string | null): ImageValidationResult => {
  const [result, setResult] = useState<ImageValidationResult>({
    isValid: false,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    if (!imageUrl) {
      setResult({ isValid: false, isLoading: false, error: 'No image URL provided' });
      return;
    }

    setResult({ isValid: false, isLoading: true, error: null });

    const img = new Image();
    
    const handleLoad = () => {
      console.log('✅ Image validation successful:', imageUrl);
      setResult({ isValid: true, isLoading: false, error: null });
    };
    
    const handleError = () => {
      const errorMsg = `Failed to load image: ${imageUrl}`;
      console.error('❌', errorMsg);
      setResult({ isValid: false, isLoading: false, error: errorMsg });
    };

    img.onload = handleLoad;
    img.onerror = handleError;
    img.src = imageUrl;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageUrl]);

  return result;
};
