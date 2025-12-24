/**
 * Real User Monitoring (RUM) Utility
 * Lightweight performance monitoring for production
 */

export interface RUMMetrics {
  // Core Web Vitals
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  fcp: number | null;
  ttfb: number | null;
  
  // Custom metrics
  routeChangeTime: number | null;
  componentRenderTime: Record<string, number>;
  apiLatency: Record<string, number[]>;
}

interface RUMOptions {
  sampleRate?: number;  // 0-1, default 0.1 (10% of users)
  reportEndpoint?: string;
  debug?: boolean;
  onReport?: (metrics: RUMReport) => void;
}

export interface RUMReport {
  sessionId: string;
  timestamp: number;
  url: string;
  userAgent: string;
  connection?: {
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
  };
  metrics: RUMMetrics;
  navigation: {
    type: string;
    redirectCount: number;
    domContentLoaded: number;
    loadComplete: number;
  };
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
  errors: ErrorEntry[];
  slowResources: SlowResource[];
}

interface ErrorEntry {
  message: string;
  stack?: string;
  timestamp: number;
}

interface SlowResource {
  name: string;
  duration: number;
  type: string;
}

// Performance entry types
interface PerformanceEntryWithProcessing extends PerformanceEntry {
  processingStart?: number;
}

interface LayoutShiftEntry extends PerformanceEntry {
  hadRecentInput?: boolean;
  value?: number;
}

// Navigator with connection info
interface NavigatorWithConnection extends Navigator {
  connection?: {
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
  };
}

// Performance with memory info
interface PerformanceWithMemory extends Performance {
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

class RUMCollector {
  private metrics: RUMMetrics = {
    lcp: null,
    fid: null,
    cls: null,
    fcp: null,
    ttfb: null,
    routeChangeTime: null,
    componentRenderTime: {},
    apiLatency: {},
  };

  private errors: ErrorEntry[] = [];
  private observers: PerformanceObserver[] = [];
  private sessionId: string;
  private isActive: boolean;
  private options: RUMOptions;
  private routeStartTime: number | null = null;
  private clsValue = 0;

  constructor(options: RUMOptions = {}) {
    this.options = {
      sampleRate: 0.1,
      debug: false,
      ...options,
    };

    // Generate session ID
    this.sessionId = this.generateSessionId();

    // Determine if this session should be sampled
    this.isActive = Math.random() < (this.options.sampleRate ?? 0.1);

    if (this.isActive) {
      this.init();
    }
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private log(message: string, data?: unknown): void {
    if (this.options.debug) {
      console.log(`[RUM] ${message}`, data ?? '');
    }
  }

  private init(): void {
    if (typeof window === 'undefined') return;

    this.log('Initializing RUM collector', { sessionId: this.sessionId });

    this.observeLCP();
    this.observeFID();
    this.observeCLS();
    this.observeFCP();
    this.measureTTFB();
    this.trackErrors();
    this.setupReporting();
  }

  private observeLCP(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.lcp = lastEntry.startTime;
        this.log('LCP recorded', this.metrics.lcp);
      });
      observer.observe({ type: 'largest-contentful-paint', buffered: true });
      this.observers.push(observer);
    } catch (e) {
      this.log('LCP observer not supported');
    }
  }

  private observeFID(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries() as PerformanceEntryWithProcessing[];
        entries.forEach((entry) => {
          if (entry.processingStart !== undefined) {
            this.metrics.fid = entry.processingStart - entry.startTime;
            this.log('FID recorded', this.metrics.fid);
          }
        });
      });
      observer.observe({ type: 'first-input', buffered: true });
      this.observers.push(observer);
    } catch (e) {
      this.log('FID observer not supported');
    }
  }

  private observeCLS(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        (list.getEntries() as LayoutShiftEntry[]).forEach((entry) => {
          if (!entry.hadRecentInput && entry.value !== undefined) {
            this.clsValue += entry.value;
            this.metrics.cls = this.clsValue;
          }
        });
      });
      observer.observe({ type: 'layout-shift', buffered: true });
      this.observers.push(observer);
    } catch (e) {
      this.log('CLS observer not supported');
    }
  }

  private observeFCP(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntriesByName('first-contentful-paint');
        if (entries.length > 0) {
          this.metrics.fcp = entries[0].startTime;
          this.log('FCP recorded', this.metrics.fcp);
        }
      });
      observer.observe({ type: 'paint', buffered: true });
      this.observers.push(observer);
    } catch (e) {
      this.log('FCP observer not supported');
    }
  }

  private measureTTFB(): void {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    if (navigation) {
      this.metrics.ttfb = navigation.responseStart - navigation.requestStart;
      this.log('TTFB recorded', this.metrics.ttfb);
    }
  }

  private trackErrors(): void {
    window.addEventListener('error', (event) => {
      this.errors.push({
        message: event.message,
        stack: event.error?.stack,
        timestamp: Date.now(),
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.errors.push({
        message: String(event.reason),
        timestamp: Date.now(),
      });
    });
  }

  private setupReporting(): void {
    // Report on page hide (most reliable for SPA)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.report();
      }
    });

    // Fallback for page unload
    window.addEventListener('pagehide', () => {
      this.report();
    });
  }

  // Public API

  /**
   * Track route change timing
   */
  startRouteChange(): void {
    if (!this.isActive) return;
    this.routeStartTime = performance.now();
  }

  endRouteChange(): void {
    if (!this.isActive || this.routeStartTime === null) return;
    this.metrics.routeChangeTime = performance.now() - this.routeStartTime;
    this.log('Route change time', this.metrics.routeChangeTime);
    this.routeStartTime = null;
  }

  /**
   * Track component render time
   */
  trackComponentRender(componentName: string, duration: number): void {
    if (!this.isActive) return;
    this.metrics.componentRenderTime[componentName] = duration;
    this.log(`Component render: ${componentName}`, duration);
  }

  /**
   * Track API latency
   */
  trackApiLatency(endpoint: string, duration: number): void {
    if (!this.isActive) return;
    if (!this.metrics.apiLatency[endpoint]) {
      this.metrics.apiLatency[endpoint] = [];
    }
    this.metrics.apiLatency[endpoint].push(duration);
    this.log(`API latency: ${endpoint}`, duration);
  }

  /**
   * Get current metrics
   */
  getMetrics(): RUMMetrics {
    return { ...this.metrics };
  }

  /**
   * Check if RUM is active for this session
   */
  isSessionActive(): boolean {
    return this.isActive;
  }

  /**
   * Generate and send performance report
   */
  report(): RUMReport | null {
    if (!this.isActive) return null;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const nav = navigator as NavigatorWithConnection;
    const perf = performance as PerformanceWithMemory;

    // Get slow resources (> 500ms)
    const slowResources: SlowResource[] = resources
      .filter(r => r.duration > 500)
      .slice(0, 10)
      .map(r => ({
        name: r.name.split('/').pop() || r.name,
        duration: Math.round(r.duration),
        type: r.initiatorType,
      }));

    const report: RUMReport = {
      sessionId: this.sessionId,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      connection: nav.connection ? {
        effectiveType: nav.connection.effectiveType,
        downlink: nav.connection.downlink,
        rtt: nav.connection.rtt,
      } : undefined,
      metrics: { ...this.metrics },
      navigation: {
        type: navigation?.type || 'unknown',
        redirectCount: navigation?.redirectCount || 0,
        domContentLoaded: Math.round(navigation?.domContentLoadedEventEnd || 0),
        loadComplete: Math.round(navigation?.loadEventEnd || 0),
      },
      memory: perf.memory ? {
        usedJSHeapSize: perf.memory.usedJSHeapSize,
        totalJSHeapSize: perf.memory.totalJSHeapSize,
        jsHeapSizeLimit: perf.memory.jsHeapSizeLimit,
      } : undefined,
      errors: this.errors.slice(-10),
      slowResources,
    };

    this.log('Generating report', report);

    // Call custom report handler
    this.options.onReport?.(report);

    // Send to endpoint if configured
    if (this.options.reportEndpoint) {
      this.sendReport(report);
    }

    return report;
  }

  private sendReport(report: RUMReport): void {
    if (!this.options.reportEndpoint) return;

    // Use sendBeacon for reliable delivery on page unload
    const blob = new Blob([JSON.stringify(report)], { type: 'application/json' });
    
    if (navigator.sendBeacon) {
      navigator.sendBeacon(this.options.reportEndpoint, blob);
    } else {
      // Fallback to fetch with keepalive
      fetch(this.options.reportEndpoint, {
        method: 'POST',
        body: blob,
        keepalive: true,
      }).catch(() => {
        // Silently fail on unload
      });
    }
  }

  /**
   * Cleanup observers
   */
  destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Singleton instance
let rumInstance: RUMCollector | null = null;

/**
 * Initialize RUM monitoring
 */
export function initRUM(options: RUMOptions = {}): RUMCollector {
  if (!rumInstance) {
    rumInstance = new RUMCollector(options);
  }
  return rumInstance;
}

/**
 * Get RUM instance
 */
export function getRUM(): RUMCollector | null {
  return rumInstance;
}

/**
 * Utility to measure function execution time
 */
export function measureExecution<T>(
  name: string,
  fn: () => T
): T {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;
  
  getRUM()?.trackComponentRender(name, duration);
  
  return result;
}

/**
 * Utility to measure async function execution time
 */
export async function measureAsyncExecution<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  
  getRUM()?.trackApiLatency(name, duration);
  
  return result;
}
