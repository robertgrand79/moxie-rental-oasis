import { useCallback, useEffect, useState } from 'react';

interface EdgeCase {
  name: string;
  description: string;
  detection: () => boolean;
  handler: () => Promise<void> | void;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface EdgeCaseStatus {
  name: string;
  detected: boolean;
  handled: boolean;
  severity: EdgeCase['severity'];
  message: string;
  timestamp: number;
}

export const useSiteMetricsEdgeCases = () => {
  const [edgeCaseStatuses, setEdgeCaseStatuses] = useState<EdgeCaseStatus[]>([]);

  // Define edge cases and their handlers
  const edgeCases: EdgeCase[] = [
    {
      name: 'Multiple GA Scripts',
      description: 'Multiple Google Analytics scripts detected',
      severity: 'medium',
      detection: () => {
        const gaScripts = document.querySelectorAll('script[src*="googletagmanager.com/gtag/js"]');
        return gaScripts.length > 1;
      },
      handler: async () => {
        const gaScripts = document.querySelectorAll('script[src*="googletagmanager.com/gtag/js"]');
        // Keep only the first (newest) script, remove duplicates
        for (let i = 1; i < gaScripts.length; i++) {
          const script = gaScripts[i];
          if (script.parentNode) {
            script.parentNode.removeChild(script);
          }
        }
        console.log('🧹 EdgeCase: Removed duplicate GA scripts');
      }
    },
    
    {
      name: 'Corrupted Local Storage',
      description: 'Analytics data in localStorage is corrupted',
      severity: 'medium',
      detection: () => {
        try {
          const testKeys = ['analytics_dailyVisitors', 'analytics_dailyPageViews', 'analytics_dailySessions'];
          for (const key of testKeys) {
            const stored = localStorage.getItem(key);
            if (stored && stored !== 'null') {
              JSON.parse(stored); // Will throw if corrupted
            }
          }
          return false;
        } catch {
          return true;
        }
      },
      handler: async () => {
        const analyticsKeys = Object.keys(localStorage).filter(key => key.startsWith('analytics_'));
        analyticsKeys.forEach(key => localStorage.removeItem(key));
        console.log('🧹 EdgeCase: Cleared corrupted analytics localStorage');
      }
    },
    
    {
      name: 'Memory Leak Detection',
      description: 'Excessive memory usage detected',
      severity: 'high',
      detection: () => {
        if ('memory' in performance) {
          const memory = (performance as any).memory;
          const usagePercent = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
          return usagePercent > 0.85; // 85% memory usage threshold
        }
        return false;
      },
      handler: async () => {
        // Force garbage collection if available
        if ('gc' in window) {
          (window as any).gc();
        }
        
        // Clear analytics cache
        const analyticsKeys = Object.keys(localStorage).filter(key => key.startsWith('analytics_'));
        analyticsKeys.forEach(key => localStorage.removeItem(key));
        
        // Remove lazy-loaded scripts if not on metrics page
        if (window.location.pathname !== '/admin/metrics') {
          const lazyScripts = document.querySelectorAll('script[data-lazy-loaded="true"]');
          lazyScripts.forEach(script => {
            if (script.parentNode) {
              script.parentNode.removeChild(script);
            }
          });
        }
        
        console.log('🧹 EdgeCase: Handled memory leak - cleared cache and scripts');
      }
    },
    
    {
      name: 'Stuck GA Initialization',
      description: 'GA initialization has been pending for too long',
      severity: 'medium',
      detection: () => {
        const gaScripts = document.querySelectorAll('script[src*="googletagmanager.com/gtag/js"]');
        const hasScript = gaScripts.length > 0;
        const hasGtag = typeof window !== 'undefined' && 'gtag' in window && typeof (window as any).gtag === 'function';
        
        // If script exists but gtag isn't available after reasonable time
        return hasScript && !hasGtag;
      },
      handler: async () => {
        // Get GA ID from existing script
        const gaScript = document.querySelector('script[src*="googletagmanager.com/gtag/js"]') as HTMLScriptElement;
        if (gaScript) {
          const src = gaScript.src;
          const gaIdMatch = src.match(/id=([^&]+)/);
          const gaId = gaIdMatch ? gaIdMatch[1] : null;
          
          if (gaId) {
            // Remove stuck script
            if (gaScript.parentNode) {
              gaScript.parentNode.removeChild(gaScript);
            }
            
            // Wait a moment then reload
            setTimeout(() => {
              window.dispatchEvent(new CustomEvent('ga-reinitialize', { detail: { gaId } }));
            }, 1000);
            
            console.log('🧹 EdgeCase: Restarted stuck GA initialization');
          }
        }
      }
    },
    
    {
      name: 'Quota Exceeded Error',
      description: 'LocalStorage quota exceeded',
      severity: 'medium',
      detection: () => {
        try {
          localStorage.setItem('test_quota', 'test');
          localStorage.removeItem('test_quota');
          return false;
        } catch (error) {
          return error instanceof Error && error.name === 'QuotaExceededError';
        }
      },
      handler: async () => {
        // Clear old analytics data
        const analyticsKeys = Object.keys(localStorage).filter(key => key.startsWith('analytics_'));
        analyticsKeys.forEach(key => localStorage.removeItem(key));
        
        // Clear other non-essential data
        const nonEssentialKeys = ['custom_events', 'temp_'];
        Object.keys(localStorage).forEach(key => {
          if (nonEssentialKeys.some(prefix => key.startsWith(prefix))) {
            localStorage.removeItem(key);
          }
        });
        
        console.log('🧹 EdgeCase: Cleared localStorage to resolve quota exceeded');
      }
    },
    
    {
      name: 'Infinite Retry Loop',
      description: 'GA initialization retry loop detected',
      severity: 'high',
      detection: () => {
        const retryCount = parseInt(sessionStorage.getItem('ga_retry_count') || '0');
        return retryCount > 5; // More than 5 retries in session
      },
      handler: async () => {
        sessionStorage.removeItem('ga_retry_count');
        
        // Clear all GA-related elements
        const gaScripts = document.querySelectorAll('script[src*="googletagmanager.com"], script[data-ga-id]');
        gaScripts.forEach(script => {
          if (script.parentNode) {
            script.parentNode.removeChild(script);
          }
        });
        
        // Clear dataLayer
        if (typeof window !== 'undefined' && (window as any).dataLayer) {
          (window as any).dataLayer.length = 0;
        }
        
        console.log('🧹 EdgeCase: Broke GA retry loop - reset all GA state');
      }
    },
    
    {
      name: 'Browser Extension Conflict',
      description: 'Ad blocker or privacy extension blocking GA',
      severity: 'low',
      detection: () => {
        // Check if script loading is being blocked
        const currentPath = window.location.pathname;
        if (currentPath === '/admin/metrics') {
          const gaScripts = document.querySelectorAll('script[src*="googletagmanager.com/gtag/js"]');
          const hasGtag = typeof window !== 'undefined' && 'gtag' in window;
          
          // If on metrics page with no scripts and no gtag, likely blocked
          return gaScripts.length === 0 && !hasGtag;
        }
        return false;
      },
      handler: async () => {
        // Can't fix ad blocker, but we can provide user feedback
        console.log('ℹ️ EdgeCase: Browser extension likely blocking GA - using demo data');
        
        // Dispatch event to show user notification
        window.dispatchEvent(new CustomEvent('ga-blocked-by-extension'));
      }
    }
  ];

  // Check for edge cases
  const checkEdgeCases = useCallback(async () => {
    const statuses: EdgeCaseStatus[] = [];
    
    for (const edgeCase of edgeCases) {
      try {
        const detected = edgeCase.detection();
        let handled = false;
        let message = `${edgeCase.description} - ${detected ? 'Detected' : 'Not detected'}`;
        
        if (detected) {
          try {
            await edgeCase.handler();
            handled = true;
            message = `${edgeCase.description} - Detected and handled`;
          } catch (error) {
            message = `${edgeCase.description} - Detected but handling failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
          }
        }
        
        statuses.push({
          name: edgeCase.name,
          detected,
          handled,
          severity: edgeCase.severity,
          message,
          timestamp: Date.now()
        });
      } catch (error) {
        statuses.push({
          name: edgeCase.name,
          detected: false,
          handled: false,
          severity: edgeCase.severity,
          message: `Edge case check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: Date.now()
        });
      }
    }
    
    setEdgeCaseStatuses(statuses);
    return statuses;
  }, []);

  // Auto-check edge cases periodically
  useEffect(() => {
    // Initial check
    checkEdgeCases();
    
    // Check every 30 seconds
    const interval = setInterval(checkEdgeCases, 30000);
    
    return () => clearInterval(interval);
  }, [checkEdgeCases]);

  // Listen for specific edge case events
  useEffect(() => {
    const handleGABlocked = () => {
      console.log('🚫 GA appears to be blocked by browser extension');
    };
    
    const handleGAReinitialize = (event: CustomEvent) => {
      console.log('🔄 GA re-initialization requested:', event.detail);
    };
    
    window.addEventListener('ga-blocked-by-extension', handleGABlocked);
    window.addEventListener('ga-reinitialize', handleGAReinitialize as EventListener);
    
    return () => {
      window.removeEventListener('ga-blocked-by-extension', handleGABlocked);
      window.removeEventListener('ga-reinitialize', handleGAReinitialize as EventListener);
    };
  }, []);

  return {
    edgeCaseStatuses,
    checkEdgeCases,
    hasActiveEdgeCases: edgeCaseStatuses.some(status => status.detected && !status.handled),
    hasCriticalEdgeCases: edgeCaseStatuses.some(status => status.detected && status.severity === 'critical')
  };
};
