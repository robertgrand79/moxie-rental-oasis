import { useEffect, useRef, useCallback } from 'react';

// Performance entry types for proper typing
interface PerformanceEntryWithProcessing extends PerformanceEntry {
  processingStart?: number;
}

interface LayoutShiftEntry extends PerformanceEntry {
  hadRecentInput?: boolean;
  value?: number;
}

interface LongTaskEntry extends PerformanceEntry {
  attribution?: Array<{ containerType?: string }>;
}

interface WebVitalsMetrics {
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  fcp: number | null;
  ttfb: number | null;
}

interface PerformanceReport {
  metrics: WebVitalsMetrics;
  navigation: {
    type: string;
    redirectCount: number;
    domContentLoaded: number;
    loadComplete: number;
  };
  resources: {
    total: number;
    slowest: { name: string; duration: number }[];
  };
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
  };
}

/**
 * Hook for tracking Web Vitals and performance metrics
 */
export function useWebVitals(options: {
  onReport?: (report: PerformanceReport) => void;
  threshold?: {
    lcp?: number;
    fid?: number;
    cls?: number;
  };
} = {}) {
  const metricsRef = useRef<WebVitalsMetrics>({
    lcp: null,
    fid: null,
    cls: null,
    fcp: null,
    ttfb: null,
  });

  const observersRef = useRef<PerformanceObserver[]>([]);

  const reportMetrics = useCallback(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

    // Get slowest resources
    const slowestResources = [...resources]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5)
      .map(r => ({ name: r.name, duration: r.duration }));

    const report: PerformanceReport = {
      metrics: { ...metricsRef.current },
      navigation: {
        type: navigation?.type || 'unknown',
        redirectCount: navigation?.redirectCount || 0,
        domContentLoaded: navigation?.domContentLoadedEventEnd || 0,
        loadComplete: navigation?.loadEventEnd || 0,
      },
      resources: {
        total: resources.length,
        slowest: slowestResources,
      },
    };

    // Add memory info if available
    const perfWithMemory = performance as Performance & {
      memory?: {
        usedJSHeapSize: number;
        totalJSHeapSize: number;
      };
    };
    if (perfWithMemory.memory) {
      report.memory = {
        usedJSHeapSize: perfWithMemory.memory.usedJSHeapSize,
        totalJSHeapSize: perfWithMemory.memory.totalJSHeapSize,
      };
    }

    options.onReport?.(report);
    return report;
  }, [options]);

  useEffect(() => {
    // LCP Observer
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        metricsRef.current.lcp = lastEntry.startTime;
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      observersRef.current.push(lcpObserver);
    } catch (e) {
      console.warn('LCP observer not supported');
    }

    // FID Observer
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries() as PerformanceEntryWithProcessing[];
        entries.forEach((entry) => {
          if (entry.processingStart !== undefined) {
            metricsRef.current.fid = entry.processingStart - entry.startTime;
          }
        });
      });
      fidObserver.observe({ type: 'first-input', buffered: true });
      observersRef.current.push(fidObserver);
    } catch (e) {
      console.warn('FID observer not supported');
    }

    // CLS Observer
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        (list.getEntries() as LayoutShiftEntry[]).forEach((entry) => {
          if (!entry.hadRecentInput && entry.value !== undefined) {
            clsValue += entry.value;
            metricsRef.current.cls = clsValue;
          }
        });
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
      observersRef.current.push(clsObserver);
    } catch (e) {
      console.warn('CLS observer not supported');
    }

    // FCP Observer
    try {
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntriesByName('first-contentful-paint');
        if (entries.length > 0) {
          metricsRef.current.fcp = entries[0].startTime;
        }
      });
      fcpObserver.observe({ type: 'paint', buffered: true });
      observersRef.current.push(fcpObserver);
    } catch (e) {
      console.warn('FCP observer not supported');
    }

    // TTFB from navigation timing
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    if (navigation) {
      metricsRef.current.ttfb = navigation.responseStart - navigation.requestStart;
    }

    // Report on page hide
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        reportMetrics();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      observersRef.current.forEach(observer => observer.disconnect());
      observersRef.current = [];
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [reportMetrics]);

  const getMetrics = useCallback(() => ({ ...metricsRef.current }), []);

  const getPerformanceScore = useCallback(() => {
    const { lcp, fid, cls } = metricsRef.current;
    const thresholds = options.threshold || {};
    
    let score = 100;
    
    // LCP scoring (target: 2.5s)
    if (lcp !== null) {
      const lcpThreshold = thresholds.lcp || 2500;
      if (lcp > lcpThreshold * 2) score -= 30;
      else if (lcp > lcpThreshold) score -= 15;
    }
    
    // FID scoring (target: 100ms)
    if (fid !== null) {
      const fidThreshold = thresholds.fid || 100;
      if (fid > fidThreshold * 3) score -= 30;
      else if (fid > fidThreshold) score -= 15;
    }
    
    // CLS scoring (target: 0.1)
    if (cls !== null) {
      const clsThreshold = thresholds.cls || 0.1;
      if (cls > clsThreshold * 2.5) score -= 30;
      else if (cls > clsThreshold) score -= 15;
    }
    
    return Math.max(0, score);
  }, [options.threshold]);

  return {
    getMetrics,
    getPerformanceScore,
    reportMetrics,
  };
}

/**
 * Track long tasks that block the main thread
 */
export function useLongTaskMonitor(
  onLongTask?: (duration: number, attribution: string) => void
) {
  useEffect(() => {
    try {
      const observer = new PerformanceObserver((list) => {
        (list.getEntries() as LongTaskEntry[]).forEach((entry) => {
          const duration = entry.duration;
          const attribution = entry.attribution?.[0]?.containerType || 'unknown';
          
          console.warn(`Long task detected: ${duration}ms (${attribution})`);
          onLongTask?.(duration, attribution);
        });
      });

      observer.observe({ type: 'longtask', buffered: true });

      return () => observer.disconnect();
    } catch (e) {
      console.warn('Long task observer not supported');
    }
  }, [onLongTask]);
}

/**
 * Track resource loading performance
 */
export function useResourceTiming() {
  const getSlowResources = useCallback((threshold = 1000) => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    return resources
      .filter(r => r.duration > threshold)
      .map(r => ({
        name: r.name,
        duration: r.duration,
        transferSize: r.transferSize,
        type: r.initiatorType,
      }))
      .sort((a, b) => b.duration - a.duration);
  }, []);

  const getTotalTransferSize = useCallback(() => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    return resources.reduce((total, r) => total + (r.transferSize || 0), 0);
  }, []);

  const getResourcesByType = useCallback(() => {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const byType: Record<string, { count: number; totalDuration: number; totalSize: number }> = {};
    
    resources.forEach(r => {
      const type = r.initiatorType;
      if (!byType[type]) {
        byType[type] = { count: 0, totalDuration: 0, totalSize: 0 };
      }
      byType[type].count++;
      byType[type].totalDuration += r.duration;
      byType[type].totalSize += r.transferSize || 0;
    });
    
    return byType;
  }, []);

  return {
    getSlowResources,
    getTotalTransferSize,
    getResourcesByType,
  };
}
