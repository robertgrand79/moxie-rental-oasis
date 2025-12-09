// Performance monitoring utilities
export const measurePerformance = () => {
  if (typeof window === 'undefined') return;

  // Measure Core Web Vitals
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      // Type guard to check if entry has value property (paint timing entries)
      if ('value' in entry && typeof entry.value === 'number') {
        console.log(`${entry.name}: ${entry.value}ms`);
      } else {
        console.log(`${entry.name}: ${entry.duration}ms`);
      }
    }
  });

  // Observe paint metrics
  try {
    observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
  } catch (e) {
    console.warn('Performance Observer not supported');
  }
};

// Preload critical resources
export const preloadCriticalResources = () => {
  // Static image preloading removed - images are now loaded dynamically per-tenant
  // from site_settings (logos, hero images). Dynamic preloading is handled by:
  // - useHeroImagePreloading hook for hero section images
  // - Site settings fetching for tenant logos
  // Preloading hardcoded paths caused 404 warnings for non-existent demo images.
};

// Optimize bundle loading with dynamic imports
export const loadNonCriticalResources = () => {
  const loadMapbox = () => import('mapbox-gl');
  const loadCharts = () => import('recharts');
  
  return {
    loadMapbox,
    loadCharts
  };
};

// Enhanced image compression utility specifically for blog images
export const compressBlogImage = async (
  file: File, 
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: 'jpeg' | 'webp' | 'original';
  } = {}
): Promise<File> => {
  const {
    maxWidth = 1200,
    maxHeight = 800,
    quality = 0.85,
    format = 'jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      try {
        // Calculate new dimensions maintaining aspect ratio
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const widthRatio = maxWidth / width;
          const heightRatio = maxHeight / height;
          const ratio = Math.min(widthRatio, heightRatio);
          
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;
        
        // Use better image rendering
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
        }
        
        // Determine output format
        let outputType = file.type;
        if (format === 'jpeg' || (format === 'original' && file.type === 'image/png' && !hasTransparency(canvas))) {
          outputType = 'image/jpeg';
        } else if (format === 'webp') {
          outputType = 'image/webp';
        }
        
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: outputType,
              lastModified: Date.now()
            });
            
            console.log('🗜️ Image compression complete:', {
              originalSize: `${(file.size / 1024).toFixed(1)}KB`,
              compressedSize: `${(compressedFile.size / 1024).toFixed(1)}KB`,
              dimensions: `${width}x${height}`,
              format: outputType,
              savings: `${(((file.size - compressedFile.size) / file.size) * 100).toFixed(1)}%`
            });
            
            resolve(compressedFile);
          } else {
            reject(new Error('Failed to compress image'));
          }
        }, outputType, quality);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

// Helper function to detect transparency in PNG images
const hasTransparency = (canvas: HTMLCanvasElement): boolean => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  // Check alpha channel
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 255) {
      return true;
    }
  }
  return false;
};

// Image compression utility
export const compressImage = (file: File, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      const maxWidth = 1200;
      const maxHeight = 800;
      
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;
      
      ctx?.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          resolve(compressedFile);
        }
      }, 'image/jpeg', quality);
    };

    img.src = URL.createObjectURL(file);
  });
};

// Accessibility utilities
export const detectReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const applyAccessibilitySettings = () => {
  if (detectReducedMotion()) {
    document.documentElement.style.setProperty('--animation-duration', '0.01ms');
    document.documentElement.style.setProperty('--transition-duration', '0.01ms');
  }
};

// Touch target optimization
export const ensureTouchTargets = () => {
  const interactiveElements = document.querySelectorAll('button, a, [role="button"], input, select, textarea');
  
  interactiveElements.forEach((element) => {
    const rect = element.getBoundingClientRect();
    if (rect.width < 44 || rect.height < 44) {
      (element as HTMLElement).style.minHeight = '44px';
      (element as HTMLElement).style.minWidth = '44px';
    }
  });
};
