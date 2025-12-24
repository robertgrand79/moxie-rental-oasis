import { useEffect } from 'react';
import { preloadImage } from '@/utils/imageOptimization';
import { debug } from '@/utils/debug';

interface ImagePreloaderProps {
  images: string[];
  priority?: boolean;
}

const ImagePreloader = ({ images, priority = false }: ImagePreloaderProps) => {
  useEffect(() => {
    if (!images.length) return;

    const preloadImages = async () => {
      debug.log('[Images]', `🚀 Preloading ${images.length} critical images...`);
      
      try {
        if (priority) {
          // Preload immediately for priority images
          await Promise.allSettled(images.map(preloadImage));
        } else {
          // Delay non-priority preloading to not block critical resources
          setTimeout(async () => {
            await Promise.allSettled(images.map(preloadImage));
          }, 1000);
        }
        
        debug.log('[Images]', '✅ Image preloading completed');
      } catch (error) {
        debug.warn('[Images]', '⚠️ Some images failed to preload:', error);
      }
    };

    preloadImages();
  }, [images, priority]);

  return null; // This component doesn't render anything
};

export default ImagePreloader;