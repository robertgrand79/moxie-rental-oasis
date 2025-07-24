import { useEffect } from 'react';
import { preloadImage } from '@/utils/imageOptimization';

interface ImagePreloaderProps {
  images: string[];
  priority?: boolean;
}

const ImagePreloader = ({ images, priority = false }: ImagePreloaderProps) => {
  useEffect(() => {
    if (!images.length) return;

    const preloadImages = async () => {
      console.log(`🚀 Preloading ${images.length} critical images...`);
      
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
        
        console.log('✅ Image preloading completed');
      } catch (error) {
        console.warn('⚠️ Some images failed to preload:', error);
      }
    };

    preloadImages();
  }, [images, priority]);

  return null; // This component doesn't render anything
};

export default ImagePreloader;