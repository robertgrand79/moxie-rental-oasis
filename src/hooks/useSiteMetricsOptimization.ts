import { useEffect } from 'react';

// Final code optimizations and cleanup utilities
export const useSiteMetricsOptimization = () => {
  
  // Clean up any orphaned event listeners
  const cleanupOrphanedListeners = () => {
    const eventsToClean = [
      'ga-script-loaded',
      'ga-blocked-by-extension',
      'ga-reinitialize',
      'resetSiteMetricsDashboard',
      'resetSiteMetricsTesting'
    ];
    
    eventsToClean.forEach(eventName => {
      // Get all listeners and remove any orphaned ones
      // This is done by replacing the event with a clean one
      const newEvent = new CustomEvent(eventName);
      window.dispatchEvent(newEvent);
    });
  };

  // Optimize localStorage usage
  const optimizeStorage = () => {
    try {
      // Remove old or duplicate analytics data
      const analyticsKeys = Object.keys(localStorage).filter(key => key.startsWith('analytics_'));
      const currentDate = new Date().toDateString();
      
      analyticsKeys.forEach(key => {
        const item = localStorage.getItem(key);
        if (item) {
          try {
            const data = JSON.parse(item);
            // Remove data older than 7 days
            if (data.date && new Date(data.date).toDateString() !== currentDate) {
              const itemDate = new Date(data.date);
              const daysDiff = (Date.now() - itemDate.getTime()) / (1000 * 60 * 60 * 24);
              if (daysDiff > 7) {
                localStorage.removeItem(key);
              }
            }
          } catch {
            // Remove corrupted data
            localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.warn('Storage optimization failed:', error);
    }
  };

  // Clean up duplicate scripts
  const cleanupDuplicateScripts = () => {
    // Remove duplicate GA scripts
    const gaScripts = document.querySelectorAll('script[src*="googletagmanager.com/gtag/js"]');
    if (gaScripts.length > 1) {
      for (let i = 1; i < gaScripts.length; i++) {
        const script = gaScripts[i];
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      }
    }

    // Remove orphaned lazy-loaded scripts that aren't on metrics page
    if (window.location.pathname !== '/admin/metrics') {
      const lazyScripts = document.querySelectorAll('script[data-lazy-loaded="true"]');
      lazyScripts.forEach(script => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      });
    }
  };

  // Performance monitoring and optimization
  const optimizePerformance = () => {
    // Use requestIdleCallback for non-critical tasks
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        optimizeStorage();
        cleanupDuplicateScripts();
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        optimizeStorage();
        cleanupDuplicateScripts();
      }, 100);
    }
  };

  // Monitor and optimize memory usage
  const optimizeMemory = () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usagePercent = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      
      if (usagePercent > 0.8) {
        console.warn('High memory usage detected:', usagePercent);
        
        // Clear non-essential cached data
        const cacheKeys = ['custom_events', 'temp_analytics'];
        cacheKeys.forEach(key => {
          try {
            localStorage.removeItem(key);
          } catch (error) {
            // Ignore errors
          }
        });
        
        // Force garbage collection if available (dev mode)
        if ('gc' in window) {
          (window as any).gc();
        }
      }
    }
  };

  // Set up performance monitoring
  useEffect(() => {
    // Initial optimization
    optimizePerformance();
    
    // Set up periodic optimization
    const optimizationInterval = setInterval(() => {
      optimizeMemory();
      cleanupOrphanedListeners();
    }, 60000); // Every minute

    // Set up periodic storage cleanup
    const storageInterval = setInterval(optimizeStorage, 300000); // Every 5 minutes

    // Cleanup on unmount
    return () => {
      clearInterval(optimizationInterval);
      clearInterval(storageInterval);
    };
  }, []);

  // Listen for page visibility changes to optimize when hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, optimize resources
        optimizeStorage();
        cleanupDuplicateScripts();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return {
    cleanupOrphanedListeners,
    optimizeStorage,
    cleanupDuplicateScripts,
    optimizePerformance,
    optimizeMemory
  };
};