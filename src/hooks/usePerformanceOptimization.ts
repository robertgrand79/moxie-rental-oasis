import { useCallback, useRef } from 'react';

interface PerformanceOptimizedInitialization {
  throttledFunction: <T extends any[]>(func: (...args: T) => Promise<any>, delay: number) => (...args: T) => Promise<any>;
  debouncedFunction: <T extends any[]>(func: (...args: T) => Promise<any>, delay: number) => (...args: T) => Promise<any>;
  memoryUsageMonitor: () => { 
    usedJSHeapSize?: number; 
    totalJSHeapSize?: number; 
    jsHeapSizeLimit?: number;
    isMemoryOptimal: boolean;
  };
  performanceObserver: (callback: (entries: PerformanceEntry[]) => void) => () => void;
}

export const usePerformanceOptimization = (): PerformanceOptimizedInitialization => {
  const throttleTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const debounceTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Throttled function execution
  const throttledFunction = useCallback(<T extends any[]>(
    func: (...args: T) => Promise<any>, 
    delay: number
  ) => {
    return (...args: T): Promise<any> => {
      const key = func.toString();
      
      if (throttleTimersRef.current.has(key)) {
        return Promise.resolve();
      }

      throttleTimersRef.current.set(key, setTimeout(() => {
        throttleTimersRef.current.delete(key);
      }, delay));

      return func(...args);
    };
  }, []);

  // Debounced function execution
  const debouncedFunction = useCallback(<T extends any[]>(
    func: (...args: T) => Promise<any>, 
    delay: number
  ) => {
    return (...args: T): Promise<any> => {
      const key = func.toString();
      
      // Clear existing timer
      const existingTimer = debounceTimersRef.current.get(key);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      return new Promise((resolve, reject) => {
        const timer = setTimeout(async () => {
          try {
            const result = await func(...args);
            resolve(result);
          } catch (error) {
            reject(error);
          } finally {
            debounceTimersRef.current.delete(key);
          }
        }, delay);

        debounceTimersRef.current.set(key, timer);
      });
    };
  }, []);

  // Memory usage monitoring
  const memoryUsageMonitor = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedPercent = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        isMemoryOptimal: usedPercent < 0.7 // Consider optimal if under 70%
      };
    }
    
    return {
      isMemoryOptimal: true // Assume optimal if can't measure
    };
  }, []);

  // Performance observer setup
  const performanceObserver = useCallback((callback: (entries: PerformanceEntry[]) => void) => {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });

      try {
        observer.observe({ 
          entryTypes: ['navigation', 'resource', 'measure', 'mark'] 
        });
        
        return () => {
          observer.disconnect();
        };
      } catch (error) {
        console.warn('Performance observer setup failed:', error);
        return () => {}; // No-op cleanup
      }
    }
    
    return () => {}; // No-op cleanup if not supported
  }, []);

  return {
    throttledFunction,
    debouncedFunction,
    memoryUsageMonitor,
    performanceObserver
  };
};