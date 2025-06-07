
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
  const criticalImages = [
    '/lovable-uploads/7471f968-e7b4-49d2-9281-852c85dc81e4.png', // Logo
    '/lovable-uploads/bd92da84-2272-4ac5-aa53-6b9afc089fa2.png'  // Family photo
  ];

  criticalImages.forEach((src) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });
};

// Register service worker
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
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
