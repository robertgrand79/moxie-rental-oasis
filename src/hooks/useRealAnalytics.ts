
import { useState, useEffect, useCallback, useMemo } from 'react';
import { analyticsService } from '@/services/analytics/analyticsService';
import { AnalyticsData, PerformanceMetrics, SystemHealth, GAHealthCheck } from '@/services/analytics/types';
import { toast } from '@/hooks/use-toast';
import { debug } from '@/utils/debug';

export const useRealAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [realTimeVisitors, setRealTimeVisitors] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(true);
  const [gaInitializing, setGaInitializing] = useState(false);
  const [gaError, setGaError] = useState<string | null>(null);
  const [gaHealthCheck, setGaHealthCheck] = useState<GAHealthCheck | null>(null);

  // Simple throttling and debouncing without external hooks
  const throttleMap = useMemo(() => new Map(), []);
  const debounceMap = useMemo(() => new Map(), []);

  const createThrottledFunction = useCallback((fn: Function, delay: number) => {
    return (...args: any[]) => {
      const key = fn.toString();
      if (!throttleMap.has(key)) {
        throttleMap.set(key, true);
        fn(...args);
        setTimeout(() => throttleMap.delete(key), delay);
      }
    };
  }, [throttleMap]);

  const createDebouncedFunction = useCallback((fn: Function, delay: number) => {
    return (...args: any[]) => {
      const key = fn.toString();
      if (debounceMap.has(key)) {
        clearTimeout(debounceMap.get(key));
      }
      const timeoutId = setTimeout(() => {
        fn(...args);
        debounceMap.delete(key);
      }, delay);
      debounceMap.set(key, timeoutId);
    };
  }, [debounceMap]);

  // Simplified data fetching
  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      setGaError(null);
      debug.analytics('Starting data fetch...');
      
      // Fetch all data in parallel with timeout
      const dataPromises = [
        analyticsService.getAnalyticsData(),
        analyticsService.getPerformanceMetrics(),
        analyticsService.getSystemHealth(),
        analyticsService.getRealTimeVisitors()
      ];

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Data fetch timeout')), 10000)
      );

      const results = await Promise.race([
        Promise.allSettled(dataPromises),
        timeoutPromise
      ]) as PromiseSettledResult<any>[];

      // Handle results
      if (results[0]?.status === 'fulfilled') {
        setAnalyticsData(results[0].value);
      }
      if (results[1]?.status === 'fulfilled') {
        setPerformanceMetrics(results[1].value);
      }
      if (results[2]?.status === 'fulfilled') {
        setSystemHealth(results[2].value);
      }
      if (results[3]?.status === 'fulfilled') {
        setRealTimeVisitors(results[3].value);
      }
      
      // Check GA status
      setGaInitializing(true);
      const [isDemoMode, healthCheck] = await Promise.allSettled([
        analyticsService.isDemoMode(),
        analyticsService.getGAHealthCheck()
      ]);
      
      if (isDemoMode.status === 'fulfilled') {
        const demoMode = isDemoMode.value;
        setIsDemo(demoMode);
        
        // Only show toast once per session
        if (!demoMode && isDemo && !sessionStorage.getItem('ga-connected-shown')) {
          toast({
            title: "Google Analytics Connected",
            description: "Now showing real analytics data.",
            duration: 3000,
          });
          sessionStorage.setItem('ga-connected-shown', 'true');
        }
      }
      
      if (healthCheck.status === 'fulfilled') {
        setGaHealthCheck(healthCheck.value);
      }
      
      setGaInitializing(false);
      debug.analytics('Data fetch complete');
    } catch (error) {
      debug.error('useRealAnalytics: Error fetching data:', error);
      setGaError(error instanceof Error ? error.message : 'Unknown error');
      setGaInitializing(false);
    } finally {
      setLoading(false);
    }
  }, [isDemo]);

  // Debounced refresh to prevent rapid clicking
  const refreshData = useCallback(
    createDebouncedFunction(async () => {
      try {
        debug.analytics('Manual refresh triggered');
        setGaInitializing(true);
        setGaError(null);
        
        // Force refresh GA initialization
        const gaRefreshResult = await analyticsService.refreshGA();
        debug.analytics('GA refresh result:', gaRefreshResult);
        
        // Re-fetch all data
        await fetchAnalyticsData();
      } catch (error) {
        debug.error('useRealAnalytics: Error during manual refresh:', error);
        setGaError(error instanceof Error ? error.message : 'Refresh failed');
        setGaInitializing(false);
      }
    }, 500),
    [createDebouncedFunction, fetchAnalyticsData]
  );

  // Throttled real-time visitors update
  const updateRealTimeVisitors = useCallback(
    createThrottledFunction(async () => {
      try {
        const visitors = await analyticsService.getRealTimeVisitors();
        setRealTimeVisitors(visitors);
      } catch (error) {
        debug.error('useRealAnalytics: Error updating real-time visitors:', error);
      }
    }, 5000),
    [createThrottledFunction]
  );

  // Initialize on mount
  useEffect(() => {
    debug.analytics('Initializing...');
    fetchAnalyticsData();
  }, []); // Remove dependencies to prevent re-initialization

  // Set up intervals for real-time updates
  useEffect(() => {
    // Update real-time visitors every 30 seconds
    const visitorInterval = setInterval(() => {
      updateRealTimeVisitors();
    }, 30000);

    // Refresh analytics data every 5 minutes
    const analyticsInterval = setInterval(() => {
      debug.analytics('Scheduled refresh');
      fetchAnalyticsData();
    }, 5 * 60 * 1000);

    return () => {
      clearInterval(visitorInterval);
      clearInterval(analyticsInterval);
    };
  }, []); // Remove dependencies to prevent recreation

  // Track events
  const trackEvent = useCallback((eventName: string, parameters?: Record<string, any>) => {
    try {
      analyticsService.trackEvent(eventName, parameters);
    } catch (error) {
      debug.error('useRealAnalytics: Error tracking event:', error);
    }
  }, []);

  return {
    analyticsData,
    performanceMetrics,
    systemHealth,
    realTimeVisitors,
    loading,
    isDemo,
    gaInitializing,
    gaError,
    gaHealthCheck,
    trackEvent,
    refreshData
  };
};
