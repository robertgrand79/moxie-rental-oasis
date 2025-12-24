
import { useEffect, useState } from 'react';
import { debug } from '@/utils/debug';

interface ImagePreloadState {
  isPreloaded: boolean;
  hasError: boolean;
}

export const useHeroImagePreloading = (imageUrl: string) => {
  const [preloadState, setPreloadState] = useState<ImagePreloadState>({
    isPreloaded: false,
    hasError: false
  });

  useEffect(() => {
    if (!imageUrl) {
      setPreloadState({ isPreloaded: true, hasError: false });
      return;
    }

    debug.ui('Starting hero image preload:', imageUrl);
    setPreloadState({ isPreloaded: false, hasError: false });

    const img = new Image();
    
    const handleLoad = () => {
      debug.ui('Hero image preloaded successfully');
      setPreloadState({ isPreloaded: true, hasError: false });
    };
    
    const handleError = () => {
      debug.error('Hero image preload failed');
      setPreloadState({ isPreloaded: true, hasError: true });
    };

    img.addEventListener('load', handleLoad);
    img.addEventListener('error', handleError);
    img.src = imageUrl;

    return () => {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
    };
  }, [imageUrl]);

  return preloadState;
};
