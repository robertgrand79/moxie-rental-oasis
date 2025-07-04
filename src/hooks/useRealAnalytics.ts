
import { useState, useEffect, useCallback } from 'react';
import { analyticsService } from '@/services/analytics/analyticsService';
import { AnalyticsData, PerformanceMetrics, SystemHealth, GAHealthCheck } from '@/services/analytics/types';
import { toast } from '@/hooks/use-toast';

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

  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      setGaError(null);
      console.log('🔄 useRealAnalytics: Starting data fetch...');
      
      // Fetch all data in parallel
      const [analytics, performance, health, visitors] = await Promise.all([
        analyticsService.getAnalyticsData(),
        analyticsService.getPerformanceMetrics(),
        analyticsService.getSystemHealth(),
        analyticsService.getRealTimeVisitors()
      ]);

      setAnalyticsData(analytics);
      setPerformanceMetrics(performance);
      setSystemHealth(health);
      setRealTimeVisitors(visitors);
      
      // Check current GA status and health
      setGaInitializing(true);
      const [isDemoMode, healthCheck] = await Promise.all([
        analyticsService.isDemoMode(),
        analyticsService.getGAHealthCheck()
      ]);
      setIsDemo(isDemoMode);
      setGaHealthCheck(healthCheck);
      setGaInitializing(false);

      // Show toast notifications for GA status changes
      if (healthCheck.status === 'healthy' && isDemo) {
        toast({
          title: "Google Analytics Connected",
          description: "Now showing real analytics data instead of demo data.",
          duration: 5000,
        });
      } else if (healthCheck.status === 'error') {
        toast({
          title: "Google Analytics Issue",
          description: healthCheck.message,
          variant: "destructive",
          duration: 7000,
        });
      }
      
      console.log(`📊 useRealAnalytics: Data fetch complete - Mode: ${isDemoMode ? 'Demo' : 'Real'}`);
    } catch (error) {
      console.error('❌ useRealAnalytics: Error fetching analytics data:', error);
      setGaError(error instanceof Error ? error.message : 'Unknown error');
      setGaInitializing(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Optimized refresh that bypasses throttling for manual requests
  const refreshData = useCallback(async () => {
    try {
      console.log('🔄 useRealAnalytics: Manual refresh triggered');
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
  }, [fetchAnalyticsData]);

  // Update real-time visitors independently
  const updateRealTimeVisitors = useCallback(async () => {
    try {
      const visitors = await analyticsService.getRealTimeVisitors();
      setRealTimeVisitors(visitors);
    } catch (error) {
      console.error('❌ useRealAnalytics: Error updating real-time visitors:', error);
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    console.log('🔄 useRealAnalytics: Initializing...');
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  // Set up intervals for real-time updates
  useEffect(() => {
    // Update real-time visitors every 30 seconds
    const visitorInterval = setInterval(updateRealTimeVisitors, 30000);

    // Refresh analytics data every 5 minutes
    const analyticsInterval = setInterval(() => {
      console.log('🔄 useRealAnalytics: Scheduled refresh');
      fetchAnalyticsData();
    }, 5 * 60 * 1000);

    return () => {
      clearInterval(visitorInterval);
      clearInterval(analyticsInterval);
    };
  }, [updateRealTimeVisitors, fetchAnalyticsData]);

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
