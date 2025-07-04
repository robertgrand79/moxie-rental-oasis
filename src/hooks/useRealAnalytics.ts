
import { useState, useEffect, useCallback } from 'react';
import { analyticsService } from '@/services/analytics/analyticsService';
import { AnalyticsData, PerformanceMetrics, SystemHealth, GAHealthCheck } from '@/services/analytics/types';
import { toast } from '@/hooks/use-toast';
import { usePerformanceOptimization } from '@/hooks/usePerformanceOptimization';

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

  // Performance optimization hooks
  const { throttledFunction, debouncedFunction, memoryUsageMonitor } = usePerformanceOptimization();

  // Optimized data fetching with performance monitoring
  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      setGaError(null);
      console.log('🔄 useRealAnalytics: Starting optimized data fetch...');
      
      // Check memory usage before heavy operations
      const memoryStatus = memoryUsageMonitor();
      if (!memoryStatus.isMemoryOptimal) {
        console.warn('⚠️ useRealAnalytics: Memory usage high, optimizing fetch strategy');
        // Add small delay to allow memory cleanup
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Fetch all data in parallel with error boundaries
      const [analytics, performance, health, visitors] = await Promise.allSettled([
        analyticsService.getAnalyticsData(),
        analyticsService.getPerformanceMetrics(),
        analyticsService.getSystemHealth(),
        analyticsService.getRealTimeVisitors()
      ]);

      // Handle results with proper error checking
      if (analytics.status === 'fulfilled') {
        setAnalyticsData(analytics.value);
      } else {
        console.error('❌ Analytics data fetch failed:', analytics.reason);
      }

      if (performance.status === 'fulfilled') {
        setPerformanceMetrics(performance.value);
      } else {
        console.error('❌ Performance metrics fetch failed:', performance.reason);
      }

      if (health.status === 'fulfilled') {
        setSystemHealth(health.value);
      } else {
        console.error('❌ System health fetch failed:', health.reason);
      }

      if (visitors.status === 'fulfilled') {
        setRealTimeVisitors(visitors.value);
      } else {
        console.error('❌ Real-time visitors fetch failed:', visitors.reason);
      }
      
      // Check current GA status and health with performance optimization
      setGaInitializing(true);
      const [isDemoMode, healthCheck] = await Promise.allSettled([
        analyticsService.isDemoMode(),
        analyticsService.getGAHealthCheck()
      ]);
      
      if (isDemoMode.status === 'fulfilled') {
        setIsDemo(isDemoMode.value);
      }
      
      if (healthCheck.status === 'fulfilled') {
        setGaHealthCheck(healthCheck.value);
        
        // Show toast notifications for GA status changes (throttled)
        if (healthCheck.value.status === 'healthy' && isDemo) {
          toast({
            title: "Google Analytics Connected",
            description: "Now showing real analytics data instead of demo data.",
            duration: 5000,
          });
        } else if (healthCheck.value.status === 'error') {
          toast({
            title: "Google Analytics Issue",
            description: healthCheck.value.message,
            variant: "destructive",
            duration: 7000,
          });
        }
      }
      
      setGaInitializing(false);
      
      console.log(`📊 useRealAnalytics: Optimized data fetch complete`);
    } catch (error) {
      console.error('❌ useRealAnalytics: Error in optimized fetch:', error);
      setGaError(error instanceof Error ? error.message : 'Unknown error');
      setGaInitializing(false);
    } finally {
      setLoading(false);
    }
  }, [memoryUsageMonitor, isDemo]);

  // Performance-optimized refresh with debouncing
  const refreshData = useCallback(
    debouncedFunction(async () => {
      try {
        console.log('🔄 useRealAnalytics: Manual refresh triggered (debounced)');
        setGaInitializing(true);
        setGaError(null);
        
        // Force refresh GA initialization (bypasses throttling)
        const gaRefreshResult = await analyticsService.refreshGA();
        console.log('📊 useRealAnalytics: GA refresh result:', gaRefreshResult);
        
        // Re-fetch all data immediately after GA refresh
        await fetchAnalyticsData();
      } catch (error) {
        console.error('❌ useRealAnalytics: Error during manual refresh:', error);
        setGaError(error instanceof Error ? error.message : 'Refresh failed');
        setGaInitializing(false);
      }
    }, 500), // 500ms debounce to prevent rapid clicking
    [debouncedFunction, fetchAnalyticsData]
  );

  // Throttled real-time visitors update
  const updateRealTimeVisitors = useCallback(
    throttledFunction(async () => {
      try {
        const visitors = await analyticsService.getRealTimeVisitors();
        setRealTimeVisitors(visitors);
      } catch (error) {
        console.error('❌ useRealAnalytics: Error updating real-time visitors:', error);
      }
    }, 5000), // Throttle to max once per 5 seconds
    [throttledFunction]
  );

  // Initialize on mount
  useEffect(() => {
    console.log('🔄 useRealAnalytics: Initializing...');
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  // Set up optimized intervals for real-time updates
  useEffect(() => {
    // Update real-time visitors every 30 seconds (throttled)
    const visitorInterval = setInterval(updateRealTimeVisitors, 30000);

    // Refresh analytics data every 5 minutes (throttled)
    const analyticsInterval = setInterval(() => {
      console.log('🔄 useRealAnalytics: Scheduled refresh (throttled)');
      
      // Use throttled version for automatic refreshes
      const throttledRefresh = throttledFunction(fetchAnalyticsData, 60000); // Max once per minute
      throttledRefresh();
    }, 5 * 60 * 1000);

    return () => {
      clearInterval(visitorInterval);
      clearInterval(analyticsInterval);
    };
  }, [updateRealTimeVisitors, fetchAnalyticsData, throttledFunction]);

  // Track events
  const trackEvent = useCallback((eventName: string, parameters?: Record<string, any>) => {
    try {
      analyticsService.trackEvent(eventName, parameters);
    } catch (error) {
      console.error('❌ useRealAnalytics: Error tracking event:', error);
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
