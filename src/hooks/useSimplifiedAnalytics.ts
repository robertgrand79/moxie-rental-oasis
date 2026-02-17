import { useDashboardStats } from '@/hooks/useDashboardStats';

interface SimplifiedAnalytics {
  checkInsToday: number;
  checkOutsToday: number;
  openWorkOrders: number;
  bookingsThisMonth: number;
  revenueThisMonth: number;
  subscribersThisMonth: number;
  totalSubscribers: number;
  averageRating: number | null;
  totalReviews: number;
  realTimeVisitors: number;
  siteStatus: 'healthy' | 'warning' | 'error';
  loadTime: number | null;
  lastUpdated: Date;
}

/**
 * Now delegates to useDashboardStats (single Edge Function call).
 * Shares the same React Query cache — no duplicate requests.
 */
export const useSimplifiedAnalytics = () => {
  const { data, isLoading, error, refetch } = useDashboardStats();

  const analytics: SimplifiedAnalytics = {
    checkInsToday: data?.checkInsToday ?? 0,
    checkOutsToday: data?.checkOutsToday ?? 0,
    openWorkOrders: data?.openWorkOrders ?? 0,
    bookingsThisMonth: data?.bookingsThisMonth ?? 0,
    revenueThisMonth: data?.revenueThisMonth ?? 0,
    subscribersThisMonth: data?.subscribersThisMonth ?? 0,
    totalSubscribers: data?.totalSubscribers ?? 0,
    averageRating: data?.averageRating ?? null,
    totalReviews: data?.totalReviews ?? 0,
    realTimeVisitors: 0,
    siteStatus: error ? 'error' : 'healthy',
    loadTime: null,
    lastUpdated: new Date(),
  };

  return { analytics, loading: isLoading, refresh: refetch };
};
