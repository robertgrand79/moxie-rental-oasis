
import { useEffect } from 'react';

export const useHeroImagePreload = (heroBackgroundImage: string, isHomePage: boolean) => {
  useEffect(() => {
    try {
      // Only preload hero image on home page to reduce console warnings
      if (isHomePage && heroBackgroundImage && heroBackgroundImage.trim() !== '') {
        let heroPreload = document.querySelector('link[rel="preload"][data-hero-image]');
        if (!heroPreload) {
          heroPreload = document.createElement('link');
          heroPreload.setAttribute('rel', 'preload');
          heroPreload.setAttribute('as', 'image');
          heroPreload.setAttribute('data-hero-image', 'true');
          
          // Add error handling for preload
          heroPreload.addEventListener('error', () => {
            console.warn('🖼️ Hero image preload failed, but this is not critical');
          });
          
          document.head.appendChild(heroPreload);
        }
        heroPreload.setAttribute('href', heroBackgroundImage);
        console.log('🚀 Preloading hero image:', heroBackgroundImage);
      } else if (!isHomePage) {
        // Remove hero preload on non-home pages
        const existingPreload = document.querySelector('link[rel="preload"][data-hero-image]');
        if (existingPreload) {
          existingPreload.remove();
        }
      }
    } catch (error) {
      console.error('Hero image preload error:', error);
    }
  }, [heroBackgroundImage, isHomePage]);
};
