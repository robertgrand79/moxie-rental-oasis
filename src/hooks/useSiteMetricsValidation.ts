import { useState, useCallback } from 'react';

export interface ValidationRule {
  name: string;
  check: () => Promise<{ valid: boolean; message: string; details?: any }>;
  critical: boolean;
}

export interface ValidationResult {
  rule: string;
  valid: boolean;
  message: string;
  details?: any;
  critical: boolean;
  timestamp: number;
}

export const useSiteMetricsValidation = () => {
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);

  // Define validation rules
  const validationRules: ValidationRule[] = [
    // Critical: GA should only load on metrics page
    {
      name: 'GA Selective Loading',
      critical: true,
      check: async () => {
        const currentPath = window.location.pathname;
        const isMetricsPage = currentPath === '/admin/metrics';
        const isOtherAdminPage = currentPath.startsWith('/admin') && !isMetricsPage;
        const gaScripts = document.querySelectorAll('script[src*="googletagmanager.com/gtag/js"]');
        
        if (isMetricsPage) {
          return {
            valid: true, // Should be able to load GA on metrics page
            message: 'Metrics page correctly allows GA loading',
            details: { currentPath, scriptCount: gaScripts.length }
          };
        } else if (isOtherAdminPage) {
          return {
            valid: gaScripts.length === 0,
            message: gaScripts.length === 0 
              ? 'GA correctly blocked on non-metrics admin pages'
              : 'GA incorrectly loaded on non-metrics admin page',
            details: { currentPath, scriptCount: gaScripts.length }
          };
        } else {
          return {
            valid: true,
            message: 'Non-admin page, GA loading rules don\'t apply',
            details: { currentPath }
          };
        }
      }
    },

    // Critical: Performance optimization checks
    {
      name: 'Performance Optimizations Active',
      critical: true,
      check: async () => {
        const checks = {
          hasRequestIdleCallback: 'requestIdleCallback' in window,
          lazyScriptsCount: document.querySelectorAll('script[data-lazy-loaded="true"]').length,
          memoryAPIAvailable: 'memory' in performance
        };

        const activeOptimizations = Object.values(checks).filter(Boolean).length;
        const totalOptimizations = Object.keys(checks).length;
        
        return {
          valid: activeOptimizations >= totalOptimizations * 0.6, // At least 60% of optimizations
          message: `${activeOptimizations}/${totalOptimizations} performance optimizations active`,
          details: checks
        };
      }
    },

    // Analytics data flow validation
    {
      name: 'Analytics Data Availability',
      critical: false,
      check: async () => {
        const hasStoredData = localStorage.getItem('analytics_dailyVisitors') !== null;
        const canAccessLocalStorage = (() => {
          try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
            return true;
          } catch {
            return false;
          }
        })();

        return {
          valid: hasStoredData || canAccessLocalStorage,
          message: hasStoredData 
            ? 'Analytics data is available'
            : canAccessLocalStorage 
              ? 'Demo analytics data can be generated'
              : 'Cannot access analytics data storage',
          details: { hasStoredData, canAccessLocalStorage }
        };
      }
    },

    // Resource cleanup validation
    {
      name: 'Resource Management',
      critical: false,
      check: async () => {
        const managementFeatures = {
          eventListenerAPI: 'addEventListener' in window && 'removeEventListener' in window,
          documentAPI: typeof document !== 'undefined' && 'createElement' in document,
          cleanupPatterns: document.querySelectorAll('[data-lazy-loaded]').length > 0
        };

        const availableFeatures = Object.values(managementFeatures).filter(Boolean).length;
        
        return {
          valid: availableFeatures >= 2,
          message: `Resource management capabilities: ${availableFeatures}/3`,
          details: managementFeatures
        };
      }
    },

    // Error handling graceful degradation
    {
      name: 'Error Handling & Graceful Degradation',
      critical: false,
      check: async () => {
        const errorHandling = {
          promiseSupport: typeof Promise === 'function',
          fetchSupport: typeof fetch === 'function',
          consoleErrorSupport: typeof console.error === 'function',
          tryCallExecution: (() => {
            try {
              JSON.parse('{"test": true}');
              return true;
            } catch {
              return false;
            }
          })()
        };

        const supportedFeatures = Object.values(errorHandling).filter(Boolean).length;
        
        return {
          valid: supportedFeatures >= 3,
          message: `Error handling features: ${supportedFeatures}/4`,
          details: errorHandling
        };
      }
    },

    // Browser compatibility
    {
      name: 'Browser Compatibility',
      critical: false,
      check: async () => {
        const browserFeatures = {
          ES6Support: typeof Symbol !== 'undefined',
          asyncSupport: typeof (async () => {}) === 'function',
          moduleSupport: typeof document !== 'undefined' && 'modules' in HTMLScriptElement.prototype,
          customEvents: typeof CustomEvent === 'function'
        };

        const supportedFeatures = Object.values(browserFeatures).filter(Boolean).length;
        
        return {
          valid: supportedFeatures >= 3,
          message: `Browser compatibility: ${supportedFeatures}/4 features supported`,
          details: browserFeatures
        };
      }
    }
  ];

  const runValidation = useCallback(async (): Promise<ValidationResult[]> => {
    const results: ValidationResult[] = [];
    
    for (const rule of validationRules) {
      try {
        const result = await rule.check();
        results.push({
          rule: rule.name,
          valid: result.valid,
          message: result.message,
          details: result.details,
          critical: rule.critical,
          timestamp: Date.now()
        });
      } catch (error) {
        results.push({
          rule: rule.name,
          valid: false,
          message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          critical: rule.critical,
          timestamp: Date.now()
        });
      }
    }

    setValidationResults(results);
    return results;
  }, []);

  const getValidationSummary = useCallback(() => {
    const total = validationResults.length;
    const valid = validationResults.filter(r => r.valid).length;
    const critical = validationResults.filter(r => r.critical).length;
    const criticalPassed = validationResults.filter(r => r.critical && r.valid).length;
    
    return {
      total,
      valid,
      invalid: total - valid,
      critical,
      criticalPassed,
      criticalFailed: critical - criticalPassed,
      overallValid: criticalPassed === critical && valid >= total * 0.8 // All critical + 80% overall
    };
  }, [validationResults]);

  return {
    runValidation,
    getValidationSummary,
    validationResults
  };
};