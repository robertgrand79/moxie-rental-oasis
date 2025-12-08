import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';
import { usePropertyFetch } from '@/hooks/usePropertyFetch';
import { startOfDay, endOfDay, format } from 'date-fns';

interface SimplifiedAnalytics {
  // Today's Activity
  checkInsToday: number;
  checkOutsToday: number;
  openWorkOrders: number;
  
  // This Month
  bookingsThisMonth: number;
  revenueThisMonth: number;
  subscribersThisMonth: number;
  totalSubscribers: number;
  
  // Reputation
  averageRating: number | null;
  totalReviews: number;
  
  // Site Health
  realTimeVisitors: number;
  siteStatus: 'healthy' | 'warning' | 'error';
  loadTime: number | null;
  
  lastUpdated: Date;
}

export const useSimplifiedAnalytics = () => {
  const [analytics, setAnalytics] = useState<SimplifiedAnalytics>({
    checkInsToday: 0,
    checkOutsToday: 0,
    openWorkOrders: 0,
    bookingsThisMonth: 0,
    revenueThisMonth: 0,
    subscribersThisMonth: 0,
    totalSubscribers: 0,
    averageRating: null,
    totalReviews: 0,
    realTimeVisitors: 0,
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
    const todayStart = format(startOfDay(now), 'yyyy-MM-dd');
    const todayEnd = format(endOfDay(now), 'yyyy-MM-dd');
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    try {
      const propertyIds = properties.map(p => p.id);
      
      // Run all queries in parallel
      const [
        subscribersResult,
        subscribersMonthResult,
        checkInsResult,
        checkOutsResult,
        workOrdersResult,
        bookingsResult,
        revenueResult,
        reviewsResult,
      ] = await Promise.all([
        // Total subscribers
        supabase
          .from('newsletter_subscribers')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true),
        
        // Subscribers this month
        supabase
          .from('newsletter_subscribers')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true)
          .gte('subscribed_at', startOfMonth),
        
        // Check-ins today
        propertyIds.length > 0 
          ? supabase
              .from('property_reservations')
              .select('*', { count: 'exact', head: true })
              .in('property_id', propertyIds)
              .eq('check_in_date', todayStart)
              .eq('booking_status', 'confirmed')
          : Promise.resolve({ count: 0 }),
        
        // Check-outs today
        propertyIds.length > 0 
          ? supabase
              .from('property_reservations')
              .select('*', { count: 'exact', head: true })
              .in('property_id', propertyIds)
              .eq('check_out_date', todayStart)
              .eq('booking_status', 'confirmed')
          : Promise.resolve({ count: 0 }),
        
        // Open work orders
        propertyIds.length > 0 
          ? supabase
              .from('work_orders')
              .select('*', { count: 'exact', head: true })
              .in('property_id', propertyIds)
              .in('status', ['pending', 'in_progress'])
          : Promise.resolve({ count: 0 }),
        
        // Bookings this month
        propertyIds.length > 0 
          ? supabase
              .from('property_reservations')
              .select('*', { count: 'exact', head: true })
              .in('property_id', propertyIds)
              .gte('created_at', startOfMonth)
          : Promise.resolve({ count: 0 }),
        
        // Revenue this month
        propertyIds.length > 0 
          ? supabase
              .from('property_reservations')
              .select('total_amount')
              .in('property_id', propertyIds)
              .gte('created_at', startOfMonth)
              .eq('booking_status', 'confirmed')
          : Promise.resolve({ data: [] }),
        
        // Reviews/testimonials
        propertyIds.length > 0 
          ? supabase
              .from('testimonials')
              .select('rating')
              .in('property_id', propertyIds)
              .eq('is_active', true)
          : Promise.resolve({ data: [] }),
      ]);

      // Calculate revenue
      const revenueThisMonth = (revenueResult.data as { total_amount: number }[] | null)?.reduce(
        (sum: number, r: { total_amount: number }) => sum + (r.total_amount || 0), 
        0
      ) || 0;

      // Calculate average rating
      const reviews = reviewsResult.data || [];
      const totalReviews = reviews.length;
      const averageRating = totalReviews > 0 
        ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews 
        : null;

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
        checkInsToday: checkInsResult.count || 0,
        checkOutsToday: checkOutsResult.count || 0,
        openWorkOrders: workOrdersResult.count || 0,
        bookingsThisMonth: bookingsResult.count || 0,
        revenueThisMonth,
        subscribersThisMonth: subscribersMonthResult.count || 0,
        totalSubscribers: subscribersResult.count || 0,
        averageRating,
        totalReviews,
        realTimeVisitors,
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
