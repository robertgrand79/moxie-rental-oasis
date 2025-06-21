
import { useEffect } from 'react';

export const useHeroImagePreload = (heroBackgroundImage: string, isHomePage: boolean) => {
  useEffect(() => {
    try {
      // Only preload hero image on home page and only if image URL is valid
      if (isHomePage && heroBackgroundImage && heroBackgroundImage.trim() !== '') {
        // Add a small delay to ensure the page is actually rendering the hero
        const preloadTimer = setTimeout(() => {
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
          console.log('🚀 Preloading hero image on home page:', heroBackgroundImage);
        }, 100); // Small delay to ensure we're actually on the home page

        return () => clearTimeout(preloadTimer);
      } else {
        // Remove hero preload on non-home pages or when no image
        const existingPreload = document.querySelector('link[rel="preload"][data-hero-image]');
        if (existingPreload) {
          existingPreload.remove();
          console.log('🗑️ Removed hero image preload (not needed on this page)');
        }
      }
    } catch (error) {
      console.error('Hero image preload error:', error);
    }
  }, [heroBackgroundImage, isHomePage]);
};
