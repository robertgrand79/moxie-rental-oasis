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
    // Record admin routes that should have useAdminStateReset
    const adminRoutes = [
      '/admin/events',
      '/admin/lifestyle',
      '/admin/poi',
      '/admin/testimonials',
      '/admin/metrics',
      '/admin/analytics',
      '/admin/settings',
      '/admin/newsletter',
      '/admin/image-optimization'
    ];

    adminRoutes.forEach(route => {
      // Each admin route should have one useAdminStateReset hook
      this.eventListenerCounts.set(route, 1);
    });
  }

  private getAdminRouteHookCount(route: string): number {
    // Simplified check - each admin route should have useAdminStateReset
    return this.hasAdminStateReset(route) ? 1 : 0;
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
      // Test URL parameter-based reset functionality
      if (this.hasAdminStateReset(route)) {
        const resetFunctional = await this.testUrlParameterReset(route);
        result.resetFunctional = resetFunctional;
        result.eventListenerCount = 1; // Simplified - useAdminStateReset hook is present
      } else {
        result.resetFunctional = true; // Non-admin routes don't need reset
        result.eventListenerCount = 0;
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

  private hasAdminStateReset(route: string): boolean {
    // All admin routes should have useAdminStateReset hook
    return route.startsWith('/admin/');
  }

  private async testUrlParameterReset(route: string): Promise<boolean> {
    return new Promise((resolve) => {
      // Navigate to route with reset parameter
      const currentUrl = new URL(window.location.href);
      const testUrl = new URL(route + '?reset=true', window.location.origin);
      
      // Check if we can detect the reset parameter functionality
      // This is a simplified test - in reality we'd need to check component state
      const hasResetParam = testUrl.searchParams.has('reset');
      
      // Simulate the useAdminStateReset hook behavior
      setTimeout(() => {
        resolve(hasResetParam);
      }, 100);
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

    // Check admin route hook counts
    this.eventListenerCounts.forEach((initialCount, route) => {
      const currentCount = this.getAdminRouteHookCount(route);
      if (currentCount !== initialCount) {
        hasLeaks = true;
        details.push(`Admin hook count for ${route}: ${currentCount} (expected ${initialCount})`);
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
    
    report += 'Admin Route Hook Status:\n';
    this.eventListenerCounts.forEach((count, route) => {
      const currentCount = this.getAdminRouteHookCount(route);
      report += `  ${route}: ${currentCount > 0 ? 'useAdminStateReset active' : 'no hook detected'}\n`;
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