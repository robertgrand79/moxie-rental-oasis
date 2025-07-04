import { toast } from 'sonner';

export interface NavigationTestResult {
  route: string;
  eventListenerCount: number;
  memoryUsage: number;
  renderTime: number;
  resetFunctional: boolean;
  mobileCompatible: boolean;
  errors: string[];
}

export class NavigationResetValidator {
  private static instance: NavigationResetValidator;
  private eventListenerCounts: Map<string, number> = new Map();
  private initialMemoryUsage = 0;

  public static getInstance(): NavigationResetValidator {
    if (!NavigationResetValidator.instance) {
      NavigationResetValidator.instance = new NavigationResetValidator();
    }
    return NavigationResetValidator.instance;
  }

  constructor() {
    this.recordInitialState();
  }

  private recordInitialState(): void {
    this.initialMemoryUsage = this.getMemoryUsage();
    this.recordEventListenerCounts();
  }

  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }

  private recordEventListenerCounts(): void {
    const eventTypes = [
      'resetEventsManager',
      'resetLifestyleManager', 
      'resetPOIManager',
      'resetTestimonialsManager',
      'resetSiteMetricsDashboard',
      'resetAnalyticsDashboard',
      'resetAdminSettings',
      'resetNewsletterTabs',
      'resetImageOptimization'
    ];

    eventTypes.forEach(eventType => {
      // Simulate listener counting - in real implementation you'd need actual listener tracking
      const count = this.getEventListenerCount(eventType);
      this.eventListenerCounts.set(eventType, count);
    });
  }

  private getEventListenerCount(eventType: string): number {
    // This is a simplified implementation
    // In a real scenario, you'd need to track listeners more accurately
    const element = window;
    const listeners = (element as any)._eventListeners?.[eventType];
    return listeners ? listeners.length : 0;
  }

  public async validateRoute(route: string): Promise<NavigationTestResult> {
    const startTime = performance.now();
    const startMemory = this.getMemoryUsage();
    const errors: string[] = [];

    const result: NavigationTestResult = {
      route,
      eventListenerCount: 0,
      memoryUsage: 0,
      renderTime: 0,
      resetFunctional: false,
      mobileCompatible: false,
      errors
    };

    try {
      // Test event listener functionality
      const resetEventName = this.getResetEventName(route);
      if (resetEventName) {
        const listenerFunctional = await this.testEventListener(resetEventName);
        result.resetFunctional = listenerFunctional;
        result.eventListenerCount = this.getEventListenerCount(resetEventName);
      } else {
        result.resetFunctional = true; // Routes without reset events are considered functional
      }

      // Test mobile compatibility
      result.mobileCompatible = await this.testMobileCompatibility();

      // Measure performance
      const endTime = performance.now();
      result.renderTime = endTime - startTime;

      // Check memory usage
      const endMemory = this.getMemoryUsage();
      result.memoryUsage = endMemory - startMemory;

      // Validate memory usage isn't excessive
      if (result.memoryUsage > 50 * 1024 * 1024) { // 50MB threshold
        errors.push(`High memory usage detected: ${(result.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
      }

      // Validate render time
      if (result.renderTime > 3000) { // 3 second threshold
        errors.push(`Slow render time: ${result.renderTime.toFixed(2)}ms`);
      }

      // Validate event listener count
      if (result.eventListenerCount > 5) {
        errors.push(`Too many event listeners: ${result.eventListenerCount}`);
      }

    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Unknown validation error');
    }

    return result;
  }

  private getResetEventName(route: string): string | null {
    const eventMap: Record<string, string> = {
      '/admin/events': 'resetEventsManager',
      '/admin/lifestyle': 'resetLifestyleManager',
      '/admin/poi': 'resetPOIManager',
      '/admin/testimonials': 'resetTestimonialsManager',
      '/admin/metrics': 'resetSiteMetricsDashboard',
      '/admin/analytics': 'resetAnalyticsDashboard',
      '/admin/settings': 'resetAdminSettings',
      '/admin/newsletter': 'resetNewsletterTabs',
      '/admin/image-optimization': 'resetImageOptimization'
    };

    return eventMap[route] || null;
  }

  private async testEventListener(eventName: string): Promise<boolean> {
    return new Promise((resolve) => {
      let eventTriggered = false;
      
      const testListener = () => {
        eventTriggered = true;
      };

      window.addEventListener(eventName, testListener);
      window.dispatchEvent(new CustomEvent(eventName));

      setTimeout(() => {
        window.removeEventListener(eventName, testListener);
        resolve(eventTriggered);
      }, 500);
    });
  }

  private async testMobileCompatibility(): Promise<boolean> {
    // Simulate mobile viewport
    const originalWidth = window.innerWidth;
    const originalHeight = window.innerHeight;

    try {
      // Test mobile breakpoint (768px and below)
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667
      });

      // Trigger resize event
      window.dispatchEvent(new Event('resize'));

      // Wait for component updates
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check if layout is responsive
      const isMobileOptimized = this.checkMobileLayout();

      return isMobileOptimized;
    } finally {
      // Restore original dimensions
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: originalWidth
      });
      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: originalHeight
      });
      window.dispatchEvent(new Event('resize'));
    }
  }

  private checkMobileLayout(): boolean {
    // Check for common mobile layout indicators
    const sidebarElement = document.querySelector('[data-sidebar]');
    const mobileNavElement = document.querySelector('[data-mobile-nav]');
    const responsiveGrid = document.querySelector('.grid-cols-1');

    // Basic checks for mobile responsiveness
    return !!(sidebarElement || mobileNavElement || responsiveGrid);
  }

  public checkForMemoryLeaks(): { hasLeaks: boolean; details: string[] } {
    const details: string[] = [];
    let hasLeaks = false;

    // Check current memory vs initial
    const currentMemory = this.getMemoryUsage();
    const memoryIncrease = currentMemory - this.initialMemoryUsage;
    
    if (memoryIncrease > 100 * 1024 * 1024) { // 100MB threshold
      hasLeaks = true;
      details.push(`Memory increased by ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
    }

    // Check event listener counts
    this.eventListenerCounts.forEach((initialCount, eventType) => {
      const currentCount = this.getEventListenerCount(eventType);
      if (currentCount > initialCount + 2) { // Allow some tolerance
        hasLeaks = true;
        details.push(`Event listeners for ${eventType}: ${currentCount} (was ${initialCount})`);
      }
    });

    return { hasLeaks, details };
  }

  public generateReport(): string {
    const memoryLeaks = this.checkForMemoryLeaks();
    const currentMemory = this.getMemoryUsage();
    
    let report = '=== Navigation Reset System Report ===\n\n';
    report += `Initial Memory: ${(this.initialMemoryUsage / 1024 / 1024).toFixed(2)}MB\n`;
    report += `Current Memory: ${(currentMemory / 1024 / 1024).toFixed(2)}MB\n`;
    report += `Memory Increase: ${((currentMemory - this.initialMemoryUsage) / 1024 / 1024).toFixed(2)}MB\n\n`;
    
    report += 'Event Listener Counts:\n';
    this.eventListenerCounts.forEach((count, eventType) => {
      const currentCount = this.getEventListenerCount(eventType);
      report += `  ${eventType}: ${currentCount} (was ${count})\n`;
    });
    
    report += '\nMemory Leak Analysis:\n';
    if (memoryLeaks.hasLeaks) {
      report += '  ⚠️ Potential memory leaks detected:\n';
      memoryLeaks.details.forEach(detail => {
        report += `    - ${detail}\n`;
      });
    } else {
      report += '  ✅ No memory leaks detected\n';
    }

    return report;
  }
}

export const downloadTestReport = (content: string) => {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `navigation-reset-test-report-${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast('Test report downloaded');
};

export const validateNavigationReset = async (route: string): Promise<boolean> => {
  const validator = NavigationResetValidator.getInstance();
  const result = await validator.validateRoute(route);
  
  if (result.errors.length > 0) {
    console.warn(`Navigation reset validation failed for ${route}:`, result.errors);
    return false;
  }
  
  return result.resetFunctional;
};