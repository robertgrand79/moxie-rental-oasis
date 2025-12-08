import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { usePropertyFetch } from '@/hooks/usePropertyFetch';

interface SimplifiedAnalytics {
  realTimeVisitors: number;
  totalSubscribers: number;
  subscribersThisMonth: number;
  bookingsThisMonth: number;
  siteStatus: 'healthy' | 'warning' | 'error';
  loadTime: number | null;
  lastUpdated: Date;
}

export const useSimplifiedAnalytics = () => {
  const [analytics, setAnalytics] = useState<SimplifiedAnalytics>({
    realTimeVisitors: 0,
    totalSubscribers: 0,
    subscribersThisMonth: 0,
    bookingsThisMonth: 0,
    siteStatus: 'healthy',
    loadTime: null,
    lastUpdated: new Date(),
  });
  const [loading, setLoading] = useState(true);

  const { organization } = useCurrentOrganization();
  const { properties } = usePropertyFetch();

  const fetchAnalytics = useCallback(async () => {
    if (!organization?.id) return;

    setLoading(true);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    try {
      // Fetch newsletter subscribers
      const { count: totalSubscribers } = await supabase
        .from('newsletter_subscribers')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      const { count: subscribersThisMonth } = await supabase
        .from('newsletter_subscribers')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .gte('subscribed_at', startOfMonth);

      // Fetch bookings this month (scoped to organization properties)
      const propertyIds = properties.map(p => p.id);
      let bookingsThisMonth = 0;
      
      if (propertyIds.length > 0) {
        const { count } = await supabase
          .from('property_reservations')
          .select('*', { count: 'exact', head: true })
          .in('property_id', propertyIds)
          .gte('created_at', startOfMonth);
        bookingsThisMonth = count || 0;
      }

      // Simple site health check based on API response time
      const startTime = performance.now();
      await supabase.from('properties').select('id').limit(1);
      const loadTime = Math.round(performance.now() - startTime);
      
      let siteStatus: 'healthy' | 'warning' | 'error' = 'healthy';
      if (loadTime > 2000) siteStatus = 'error';
      else if (loadTime > 1000) siteStatus = 'warning';

      // Simulate real-time visitors (in production, this would come from analytics service)
      const realTimeVisitors = Math.floor(Math.random() * 5) + 1;

      setAnalytics({
        realTimeVisitors,
        totalSubscribers: totalSubscribers || 0,
        subscribersThisMonth: subscribersThisMonth || 0,
        bookingsThisMonth,
        siteStatus,
        loadTime,
        lastUpdated: new Date(),
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setAnalytics(prev => ({ ...prev, siteStatus: 'error' }));
    } finally {
      setLoading(false);
    }
  }, [organization?.id, properties]);

  useEffect(() => {
    fetchAnalytics();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  return { analytics, loading, refresh: fetchAnalytics };
};
