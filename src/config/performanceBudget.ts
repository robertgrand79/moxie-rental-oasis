/**
 * Performance budget configuration
 * These thresholds help maintain application performance
 */
export const PERFORMANCE_BUDGET = {
  // Core Web Vitals targets
  webVitals: {
    lcp: 2500, // Largest Contentful Paint (ms)
    fid: 100, // First Input Delay (ms)
    cls: 0.1, // Cumulative Layout Shift
    fcp: 1800, // First Contentful Paint (ms)
    ttfb: 800, // Time to First Byte (ms)
  },

  // Bundle size limits (bytes)
  bundleSize: {
    mainBundle: 250 * 1024, // 250KB
    vendorBundle: 500 * 1024, // 500KB
    lazyChunk: 100 * 1024, // 100KB per lazy chunk
    totalInitial: 750 * 1024, // 750KB total initial load
  },

  // Image optimization
  images: {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 80,
    lazyLoadThreshold: 100, // px from viewport
    formats: ['webp', 'jpeg'] as const,
  },

  // API response times (ms)
  api: {
    fast: 100,
    acceptable: 500,
    slow: 1000,
    timeout: 10000,
  },

  // Cache durations (ms)
  cache: {
    static: 24 * 60 * 60 * 1000, // 24 hours
    dynamic: 5 * 60 * 1000, // 5 minutes
    userSpecific: 60 * 1000, // 1 minute
  },

  // List virtualization
  lists: {
    virtualizationThreshold: 50, // Virtualize lists with more items
    pageSize: 20,
    overscan: 3,
  },

  // Animation performance
  animations: {
    maxDuration: 300, // ms
    useReducedMotion: true,
  },
} as const;

/**
 * Check if a metric violates the performance budget
 */
export function checkPerformanceBudget(
  category: keyof typeof PERFORMANCE_BUDGET,
  metric: string,
  value: number
): { passed: boolean; threshold: number; severity: 'ok' | 'warning' | 'critical' } {
  const budgetCategory = PERFORMANCE_BUDGET[category] as Record<string, number>;
  const threshold = budgetCategory[metric];

  if (threshold === undefined) {
    return { passed: true, threshold: 0, severity: 'ok' };
  }

  // For CLS, lower is better
  const isCLS = metric === 'cls';
  const passed = isCLS ? value <= threshold : value <= threshold;
  
  let severity: 'ok' | 'warning' | 'critical' = 'ok';
  if (!passed) {
    const ratio = value / threshold;
    severity = ratio > 2 ? 'critical' : 'warning';
  }

  return { passed, threshold, severity };
}

/**
 * Log performance violations
 */
export function logPerformanceViolation(
  category: string,
  metric: string,
  value: number,
  threshold: number
): void {
  const message = `Performance budget exceeded: ${category}.${metric} = ${value} (threshold: ${threshold})`;
  
  if (process.env.NODE_ENV === 'development') {
    console.warn(`⚠️ ${message}`);
  }
  
  // Could send to analytics/monitoring service
}

/**
 * Performance monitoring decorator for async functions
 */
export function withPerformanceMonitoring<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  name: string,
  thresholdMs = PERFORMANCE_BUDGET.api.acceptable
): T {
  return (async (...args: Parameters<T>) => {
    const start = performance.now();
    try {
      return await fn(...args);
    } finally {
      const duration = performance.now() - start;
      if (duration > thresholdMs) {
        logPerformanceViolation('api', name, duration, thresholdMs);
      }
    }
  }) as T;
}
