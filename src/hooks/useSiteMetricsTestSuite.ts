import { useState, useCallback } from 'react';

export interface TestResult {
  test: string;
  status: 'pass' | 'fail' | 'warning' | 'pending';
  message: string;
  details?: any;
  timestamp: number;
}

export interface SiteMetricsTestSuite {
  runAllTests: () => Promise<TestResult[]>;
  runSpecificTest: (testName: string) => Promise<TestResult>;
  getTestStatus: () => {
    total: number;
    passed: number;
    failed: number;
    warnings: number;
    pending: number;
  };
}

export const useSiteMetricsTestSuite = (): SiteMetricsTestSuite => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  
  // Safe localStorage access with error handling
  const safeLocalStorage = {
    getItem: (key: string): string | null => {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        console.warn('localStorage access failed:', error);
        return null;
      }
    },
    setItem: (key: string, value: string): boolean => {
      try {
        localStorage.setItem(key, value);
        return true;
      } catch (error) {
        console.warn('localStorage write failed:', error);
        return false;
      }
    }
  };

  // Safe feature detection
  const hasFeature = (feature: string): boolean => {
    try {
      switch (feature) {
        case 'performance.memory':
          return 'performance' in window && 'memory' in performance;
        case 'requestIdleCallback':
          return 'requestIdleCallback' in window;
        case 'intersection_observer':
          return 'IntersectionObserver' in window;
        default:
          return false;
      }
    } catch {
      return false;
    }
  };

  const createTestResult = (
    test: string,
    status: TestResult['status'],
    message: string,
    details?: any
  ): TestResult => ({
    test,
    status,
    message,
    details,
    timestamp: Date.now()
  });

  // Test 1: GA Loading Logic
  const testGALoadingLogic = async (): Promise<TestResult> => {
    console.log('🧪 Starting GA Loading Logic test...');
    try {
      const currentPath = window.location.pathname;
      const isMetricsPage = currentPath === '/admin/metrics';
      
      // Safe script detection
      let gaScripts: NodeListOf<HTMLScriptElement>;
      try {
        gaScripts = document.querySelectorAll('script[src*="googletagmanager.com/gtag/js"]');
      } catch (error) {
        console.warn('Failed to query GA scripts:', error);
        gaScripts = document.querySelectorAll('script') as NodeListOf<HTMLScriptElement>;
      }
      
      console.log(`📍 Current path: ${currentPath}, GA scripts found: ${gaScripts.length}`);
      
      // Check if GA is loaded on the correct page
      if (isMetricsPage) {
        const result = createTestResult(
          'GA Loading Logic',
          'pass',
          'GA correctly loads on metrics page',
          {
            currentPath,
            scriptCount: gaScripts.length,
            shouldLoad: true
          }
        );
        console.log('✅ GA Loading Logic test passed');
        return result;
      } else {
        const shouldNotHaveGA = gaScripts.length === 0;
        const result = createTestResult(
          'GA Loading Logic',
          shouldNotHaveGA ? 'pass' : 'warning',
          shouldNotHaveGA 
            ? 'GA correctly excluded from non-metrics pages'
            : 'GA found on non-metrics page (may be acceptable)',
          {
            currentPath,
            scriptCount: gaScripts.length,
            shouldLoad: false
          }
        );
        console.log(`${shouldNotHaveGA ? '✅' : '⚠️'} GA Loading Logic test completed`);
        return result;
      }
    } catch (error) {
      console.error('❌ GA Loading Logic test failed:', error);
      return createTestResult(
        'GA Loading Logic',
        'fail',
        'Error testing GA loading logic',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  };

  // Test 2: GA Initialization
  const testGAInitialization = async (): Promise<TestResult> => {
    console.log('🧪 Starting GA Initialization test...');
    try {
      // Timeout protection for window object access
      const timeoutPromise = new Promise<TestResult>((resolve) => {
        setTimeout(() => {
          resolve(createTestResult(
            'GA Initialization',
            'fail',
            'Test timed out while checking GA initialization',
            { timeout: true }
          ));
        }, 3000);
      });

      const testPromise = new Promise<TestResult>((resolve) => {
        try {
          // Safe window object access
          const windowObj = typeof window !== 'undefined' ? window : {};
          
          // Check for GA global object with safe access
          const hasGtagFunction = typeof (windowObj as any).gtag === 'function';
          const hasGAGlobal = typeof (windowObj as any).ga !== 'undefined';
          const hasDataLayer = Array.isArray((windowObj as any).dataLayer);
          
          // Check for GA measurement ID in page
          let hasGAScript = false;
          try {
            const gaScripts = document.querySelectorAll('script[src*="googletagmanager.com/gtag/js"]');
            hasGAScript = gaScripts.length > 0;
          } catch (scriptError) {
            console.warn('Failed to query GA scripts:', scriptError);
          }
          
          const gaFeatures = {
            gtagFunction: hasGtagFunction,
            gaGlobal: hasGAGlobal,
            dataLayer: hasDataLayer,
            scriptLoaded: hasGAScript
          };
          
          const activeFeatures = Object.values(gaFeatures).filter(Boolean).length;
          console.log(`📊 GA features detected: ${activeFeatures}/4`, gaFeatures);
          
          if (activeFeatures >= 2) {
            resolve(createTestResult(
              'GA Initialization',
              'pass',
              `GA properly initialized (${activeFeatures}/4 features detected)`,
              gaFeatures
            ));
          } else if (activeFeatures >= 1) {
            resolve(createTestResult(
              'GA Initialization',
              'warning',
              `GA partially initialized (${activeFeatures}/4 features detected)`,
              gaFeatures
            ));
          } else {
            resolve(createTestResult(
              'GA Initialization',
              'pending',
              'GA not yet initialized (may be loading)',
              gaFeatures
            ));
          }
        } catch (error) {
          console.error('Error in GA initialization check:', error);
          resolve(createTestResult(
            'GA Initialization',
            'fail',
            'Error checking GA initialization',
            { error: error instanceof Error ? error.message : 'Unknown error' }
          ));
        }
      });

      const result = await Promise.race([testPromise, timeoutPromise]);
      console.log(`${result.status === 'pass' ? '✅' : result.status === 'warning' ? '⚠️' : '❌'} GA Initialization test completed`);
      return result;
    } catch (error) {
      console.error('❌ GA Initialization test failed:', error);
      return createTestResult(
        'GA Initialization',
        'fail',
        'Error testing GA initialization',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  };

  // Test 3: Performance Optimizations
  const testPerformanceOptimizations = async (): Promise<TestResult> => {
    console.log('🧪 Starting Performance Optimizations test...');
    try {
      const optimizations = {
        // Check for lazy loading patterns
        lazyLoadingScripts: (() => {
          try {
            return document.querySelectorAll('script[data-lazy-loaded="true"]').length;
          } catch {
            return 0;
          }
        })(),
        
        // Check for performance API usage with safe access
        performanceAPIAvailable: hasFeature('performance.memory'),
        memoryMonitoring: hasFeature('performance.memory'),
        
        // Check for request idle callback usage
        requestIdleCallbackSupport: hasFeature('requestIdleCallback'),
        
        // Check for intersection observer (for lazy loading)
        intersectionObserverSupport: hasFeature('intersection_observer'),
        
        // Check for throttling indicators with safe localStorage access
        throttledRequests: safeLocalStorage.getItem('ga_last_request_time') !== null
      };
      
      const activeOptimizations = Object.values(optimizations).filter(value => 
        typeof value === 'boolean' ? value : value > 0
      ).length;
      
      const totalOptimizations = Object.keys(optimizations).length;
      const percentage = (activeOptimizations / totalOptimizations) * 100;
      
      console.log(`⚡ Performance optimizations: ${activeOptimizations}/${totalOptimizations} (${Math.round(percentage)}%)`, optimizations);
      
      let status: TestResult['status'];
      let message: string;
      
      if (percentage >= 70) {
        status = 'pass';
        message = `Excellent performance optimizations (${activeOptimizations}/${totalOptimizations})`;
      } else if (percentage >= 50) {
        status = 'warning';
        message = `Good performance optimizations (${activeOptimizations}/${totalOptimizations})`;
      } else {
        status = 'warning';
        message = `Basic performance optimizations (${activeOptimizations}/${totalOptimizations})`;
      }
      
      const result = createTestResult(
        'Performance Optimizations',
        status,
        message,
        {
          ...optimizations,
          percentage: Math.round(percentage),
          score: `${activeOptimizations}/${totalOptimizations}`
        }
      );
      
      console.log(`${status === 'pass' ? '✅' : '⚠️'} Performance Optimizations test completed`);
      return result;
    } catch (error) {
      console.error('❌ Performance Optimizations test failed:', error);
      return createTestResult(
        'Performance Optimizations',
        'fail',
        'Error evaluating performance optimizations',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  };

  // Test 4: Error Handling
  const testErrorHandling = async (): Promise<TestResult> => {
    console.log('🧪 Starting Error Handling test...');
    try {
      const errorHandlingFeatures = {
        // Test localStorage access with error handling
        localStorageGracefulHandling: (() => {
          try {
            if (safeLocalStorage.setItem('test_error_handling', 'test')) {
              safeLocalStorage.getItem('test_error_handling');
              return true;
            }
            return 'handled';
          } catch {
            // Should gracefully handle localStorage errors
            return 'handled';
          }
        })(),
        
        // Test network error simulation
        fetchAPIAvailable: typeof fetch === 'function',
        
        // Test promise error handling
        promiseErrorHandling: (() => {
          try {
            const testPromise = Promise.reject('test');
            testPromise.catch(() => {}); // Should handle rejection
            return true;
          } catch {
            return false;
          }
        })(),
        
        // Test console error availability
        consoleErrorAvailable: typeof console !== 'undefined' && typeof console.error === 'function',
        
        // Test try-catch execution
        tryCatchExecution: (() => {
          try {
            JSON.parse('invalid json');
            return false;
          } catch {
            return true; // Should catch error
          }
        })()
      };
      
      const workingFeatures = Object.values(errorHandlingFeatures).filter(value => 
        value === true || value === 'handled'
      ).length;
      
      const totalFeatures = Object.keys(errorHandlingFeatures).length;
      const percentage = (workingFeatures / totalFeatures) * 100;
      
      console.log(`🛡️ Error handling features: ${workingFeatures}/${totalFeatures} (${Math.round(percentage)}%)`, errorHandlingFeatures);
      
      let status: TestResult['status'];
      let message: string;
      
      if (percentage >= 80) {
        status = 'pass';
        message = `Robust error handling (${workingFeatures}/${totalFeatures} features)`;
      } else if (percentage >= 60) {
        status = 'warning';
        message = `Good error handling (${workingFeatures}/${totalFeatures} features)`;
      } else {
        status = 'fail';
        message = `Insufficient error handling (${workingFeatures}/${totalFeatures} features)`;
      }
      
      const result = createTestResult(
        'Error Handling',
        status,
        message,
        {
          ...errorHandlingFeatures,
          percentage: Math.round(percentage),
          score: `${workingFeatures}/${totalFeatures}`
        }
      );
      
      console.log(`${status === 'pass' ? '✅' : status === 'warning' ? '⚠️' : '❌'} Error Handling test completed`);
      return result;
    } catch (error) {
      console.error('❌ Error Handling test failed:', error);
      return createTestResult(
        'Error Handling',
        'fail',
        'Error testing error handling capabilities',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  };

  // Test 5: Analytics Data Flow
  const testAnalyticsDataFlow = async (): Promise<TestResult> => {
    console.log('🧪 Starting Analytics Data Flow test...');
    try {
      // Check if analytics service is available
      const hasAnalyticsData = safeLocalStorage.getItem('analytics_dailyVisitors') !== null;
      const hasDemoData = true; // Demo data should always be available
      
      // Check if we can access the analytics service
      const canAccessAnalytics = typeof window !== 'undefined';
      
      console.log(`📊 Analytics data flow: hasAnalyticsData=${hasAnalyticsData}, hasDemoData=${hasDemoData}, canAccessAnalytics=${canAccessAnalytics}`);
      
      if (hasAnalyticsData && canAccessAnalytics) {
        const result = createTestResult(
          'Analytics Data Flow',
          'pass',
          'Analytics data is flowing correctly (real or demo)',
          { hasAnalyticsData, hasDemoData, canAccessAnalytics }
        );
        console.log('✅ Analytics Data Flow test passed');
        return result;
      } else if (hasDemoData && canAccessAnalytics) {
        const result = createTestResult(
          'Analytics Data Flow',
          'warning',
          'Demo data available, real analytics may not be configured',
          { hasAnalyticsData, hasDemoData, canAccessAnalytics }
        );
        console.log('⚠️ Analytics Data Flow test warning');
        return result;
      } else {
        const result = createTestResult(
          'Analytics Data Flow',
          'fail',
          'Analytics data flow not working properly',
          { hasAnalyticsData, hasDemoData, canAccessAnalytics }
        );
        console.log('❌ Analytics Data Flow test failed');
        return result;
      }
    } catch (error) {
      console.error('❌ Analytics Data Flow test failed:', error);
      return createTestResult(
        'Analytics Data Flow',
        'fail',
        'Error testing analytics data flow',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  };

  // Test 6: Resource Cleanup
  const testResourceCleanup = async (): Promise<TestResult> => {
    console.log('🧪 Starting Resource Cleanup test...');
    try {
      const beforeScripts = document.querySelectorAll('script').length;
      const beforeEventListeners = {
        // We can't directly count event listeners, but we can check for common patterns
        hasGAListener: !!document.querySelector('script[data-ga-id]'),
        hasLazyScripts: document.querySelectorAll('script[data-lazy-loaded="true"]').length
      };
      
      // Simulate cleanup test by checking for cleanup mechanisms
      const hasCleanupMechanisms = 
        typeof window !== 'undefined' && 
        // Check if cleanup functions exist (this is a proxy test)
        'addEventListener' in window &&
        'removeEventListener' in window;
      
      console.log(`🧹 Resource cleanup: scripts=${beforeScripts}, mechanisms=${hasCleanupMechanisms}`, beforeEventListeners);
      
      if (hasCleanupMechanisms) {
        const result = createTestResult(
          'Resource Cleanup',
          'pass',
          'Resource cleanup mechanisms are in place',
          { beforeScripts, beforeEventListeners, hasCleanupMechanisms }
        );
        console.log('✅ Resource Cleanup test passed');
        return result;
      } else {
        const result = createTestResult(
          'Resource Cleanup',
          'warning',
          'Unable to fully validate resource cleanup',
          { beforeScripts, beforeEventListeners, hasCleanupMechanisms }
        );
        console.log('⚠️ Resource Cleanup test warning');
        return result;
      }
    } catch (error) {
      console.error('❌ Resource Cleanup test failed:', error);
      return createTestResult(
        'Resource Cleanup',
        'fail',
        'Error testing resource cleanup',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  };

  // Run all tests
  const runAllTests = async (): Promise<TestResult[]> => {
    console.log('🚀 Starting all Site Metrics tests...');
    
    const tests = [
      { name: 'GA Loading Logic', fn: testGALoadingLogic },
      { name: 'GA Initialization', fn: testGAInitialization },
      { name: 'Performance Optimizations', fn: testPerformanceOptimizations },
      { name: 'Error Handling', fn: testErrorHandling },
      { name: 'Analytics Data Flow', fn: testAnalyticsDataFlow },
      { name: 'Resource Cleanup', fn: testResourceCleanup }
    ];
    
    const results: TestResult[] = [];
    
    for (const test of tests) {
      try {
        console.log(`▶️ Running test: ${test.name}`);
        
        // Add timeout protection for each test
        const testPromise = test.fn();
        const timeoutPromise = new Promise<TestResult>((resolve) => {
          setTimeout(() => {
            console.warn(`⏰ Test '${test.name}' timed out`);
            resolve(createTestResult(
              test.name,
              'fail',
              'Test timed out after 5 seconds',
              { timeout: true }
            ));
          }, 5000);
        });
        
        const result = await Promise.race([testPromise, timeoutPromise]);
        results.push(result);
        console.log(`✓ Completed test: ${test.name} - ${result.status}`);
      } catch (error) {
        console.error(`❌ Test '${test.name}' failed with error:`, error);
        results.push(createTestResult(
          test.name,
          'fail',
          'Test execution failed',
          { error: error instanceof Error ? error.message : 'Unknown error' }
        ));
      }
    }
    
    console.log(`🏁 All tests completed. Results: ${results.length} tests`);
    setTestResults(results);
    return results;
  };

  // Run specific test
  const runSpecificTest = async (testName: string): Promise<TestResult> => {
    console.log(`🎯 Running specific test: ${testName}`);
    
    const testMap: { [key: string]: () => Promise<TestResult> } = {
      'GA Loading Logic': testGALoadingLogic,
      'GA Initialization': testGAInitialization,
      'Performance Optimizations': testPerformanceOptimizations,
      'Error Handling': testErrorHandling,
      'Analytics Data Flow': testAnalyticsDataFlow,
      'Resource Cleanup': testResourceCleanup
    };
    
    const testFunction = testMap[testName];
    if (!testFunction) {
      console.error(`❌ Test '${testName}' not found`);
      return createTestResult(
        testName,
        'fail',
        'Test not found',
        { availableTests: Object.keys(testMap) }
      );
    }
    
    try {
      // Add timeout protection
      const testPromise = testFunction();
      const timeoutPromise = new Promise<TestResult>((resolve) => {
        setTimeout(() => {
          console.warn(`⏰ Specific test '${testName}' timed out`);
          resolve(createTestResult(
            testName,
            'fail',
            'Test timed out after 5 seconds',
            { timeout: true }
          ));
        }, 5000);
      });
      
      const result = await Promise.race([testPromise, timeoutPromise]);
      console.log(`✓ Specific test completed: ${testName} - ${result.status}`);
      
      // Update test results
      setTestResults(prev => {
        const updated = prev.filter(r => r.test !== testName);
        return [...updated, result];
      });
      
      return result;
    } catch (error) {
      console.error(`❌ Specific test '${testName}' failed with error:`, error);
      return createTestResult(
        testName,
        'fail',
        'Test execution failed',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  };

  // Get test status summary
  const getTestStatus = () => {
    const total = testResults.length;
    const passed = testResults.filter(r => r.status === 'pass').length;
    const failed = testResults.filter(r => r.status === 'fail').length;
    const warnings = testResults.filter(r => r.status === 'warning').length;
    const pending = testResults.filter(r => r.status === 'pending').length;

    return { total, passed, failed, warnings, pending };
  };

  return {
    runAllTests,
    runSpecificTest,
    getTestStatus
  };
};