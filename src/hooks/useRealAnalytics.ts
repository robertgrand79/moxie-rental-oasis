
import { useState, useEffect } from 'react';
import { analyticsService } from '@/services/analytics/analyticsService';
import { AnalyticsData, PerformanceMetrics, SystemHealth } from '@/services/analytics/types';

export const useRealAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [realTimeVisitors, setRealTimeVisitors] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(true);
  const [gaInitializing, setGaInitializing] = useState(false);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching analytics data...');
      
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
      
      // Check if we have real Google Analytics configured
      setGaInitializing(true);
      const hasRealGA = await analyticsService.initializeGA();
      setIsDemo(!hasRealGA);
      setGaInitializing(false);
      
      console.log(`📊 Analytics mode: ${hasRealGA ? 'Real Data' : 'Demo Mode'}`);
    } catch (error) {
      console.error('❌ Error fetching analytics data:', error);
      setGaInitializing(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();

    // Update real-time visitors every 30 seconds
    const visitorInterval = setInterval(async () => {
      const visitors = await analyticsService.getRealTimeVisitors();
      setRealTimeVisitors(visitors);
    }, 30000);

    // Refresh analytics data every 5 minutes
    const analyticsInterval = setInterval(fetchAnalyticsData, 5 * 60 * 1000);

    return () => {
      clearInterval(visitorInterval);
      clearInterval(analyticsInterval);
    };
  }, []);

  const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
    analyticsService.trackEvent(eventName, parameters);
  };

  const refreshData = async () => {
    console.log('🔄 Manual refresh triggered');
    // Force refresh GA initialization
    await analyticsService.refreshGA();
    await fetchAnalyticsData();
  };

  return {
    analyticsData,
    performanceMetrics,
    systemHealth,
    realTimeVisitors,
    loading,
    isDemo,
    gaInitializing,
    trackEvent,
    refreshData
  };
};
