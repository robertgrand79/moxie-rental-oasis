
import { useEffect } from 'react';

export const useHeroImagePreload = (heroBackgroundImage: string, isHomePage: boolean) => {
  useEffect(() => {
    try {
      // Only preload hero image on home page and only if image URL is valid
      if (isHomePage && heroBackgroundImage && heroBackgroundImage.trim() !== '') {
        // Check if image URL is actually valid before preloading
        const isValidImageUrl = (url: string): boolean => {
          try {
            const urlObj = new URL(url, window.location.origin);
            return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
          } catch {
            return false;
          }
        };

        if (!isValidImageUrl(heroBackgroundImage)) {
          console.warn('🖼️ Hero image URL is not valid, skipping preload:', heroBackgroundImage);
          return;
        }

        // Use Intersection Observer to check if hero section is actually visible
        const heroSection = document.querySelector('[data-hero-section]') || document.querySelector('.hero-section');
        
        const preloadImage = () => {
          let heroPreload = document.querySelector('link[rel="preload"][data-hero-image]') as HTMLLinkElement;
          
          // Only create new preload if URL has changed
          if (!heroPreload || heroPreload.href !== heroBackgroundImage) {
            // Remove existing preload if URL changed
            if (heroPreload && heroPreload.href !== heroBackgroundImage) {
              heroPreload.remove();
              heroPreload = null;
            }

            if (!heroPreload) {
              heroPreload = document.createElement('link');
              heroPreload.setAttribute('rel', 'preload');
              heroPreload.setAttribute('as', 'image');
              heroPreload.setAttribute('data-hero-image', 'true');
              
              // Add comprehensive error handling
              heroPreload.addEventListener('error', (e) => {
                console.warn('🖼️ Hero image preload failed (not critical):', heroBackgroundImage);
                // Remove failed preload to prevent repeated attempts
                heroPreload?.remove();
              });

              heroPreload.addEventListener('load', () => {
                console.log('✅ Hero image preloaded successfully:', heroBackgroundImage);
              });
              
              document.head.appendChild(heroPreload);
            }
            
            heroPreload.setAttribute('href', heroBackgroundImage);
            console.log('🚀 Preloading hero image on home page:', heroBackgroundImage);
          }
        };

        // If hero section is visible or we can't find it, preload immediately
        if (!heroSection) {
          // Small delay to ensure DOM is ready
          const preloadTimer = setTimeout(preloadImage, 50);
          return () => clearTimeout(preloadTimer);
        }

        // Use Intersection Observer for better performance
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                preloadImage();
                observer.disconnect();
              }
            });
          },
          { rootMargin: '100px' } // Start preloading when hero is 100px away from viewport
        );

        observer.observe(heroSection);

        return () => {
          observer.disconnect();
        };

      } else {
        // Clean up hero preload on non-home pages or when no image
        const existingPreload = document.querySelector('link[rel="preload"][data-hero-image]');
        if (existingPreload) {
          existingPreload.remove();
          console.log('🗑️ Removed hero image preload (not needed on this page)');
        }
      }
    } catch (error) {
      console.error('Hero image preload error:', error);
      // Clean up any failed preload attempts
      const failedPreload = document.querySelector('link[rel="preload"][data-hero-image]');
      if (failedPreload) {
        failedPreload.remove();
      }
    }
  }, [heroBackgroundImage, isHomePage]);
};
