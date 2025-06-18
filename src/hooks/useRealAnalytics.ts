
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

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
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
      const hasRealGA = await analyticsService.initializeGA();
      setIsDemo(!hasRealGA);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
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

  const refreshData = () => {
    fetchAnalyticsData();
  };

  return {
    analyticsData,
    performanceMetrics,
    systemHealth,
    realTimeVisitors,
    loading,
    isDemo,
    trackEvent,
    refreshData
  };
};
