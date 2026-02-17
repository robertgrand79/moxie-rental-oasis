import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentOrganization } from '@/contexts/OrganizationContext';

interface DashboardStats {
  properties: { total: number };
  blogPosts: { total: number; published: number };
  pointsOfInterest: { total: number; featured: number };
  galleryItems: { total: number; featured: number };
  testimonials: { total: number; featured: number };
  subscriberCount: number;
  recentBlogPosts: Array<{
    id: string;
    title: string;
    status: string;
    created_at: string;
  }>;
  // Analytics (merged from useSimplifiedAnalytics)
  checkInsToday: number;
  checkOutsToday: number;
  openWorkOrders: number;
  bookingsThisMonth: number;
  revenueThisMonth: number;
  subscribersThisMonth: number;
  totalSubscribers: number;
  averageRating: number | null;
  totalReviews: number;
}

export const useDashboardStats = () => {
  const { organization } = useCurrentOrganization();
  const organizationId = organization?.id;

  return useQuery({
    queryKey: ['dashboard-stats', organizationId],
    queryFn: async (): Promise<DashboardStats> => {
      if (!organizationId) {
        return {
          properties: { total: 0 },
          blogPosts: { total: 0, published: 0 },
          pointsOfInterest: { total: 0, featured: 0 },
          galleryItems: { total: 0, featured: 0 },
          testimonials: { total: 0, featured: 0 },
          subscriberCount: 0,
          recentBlogPosts: [],
          checkInsToday: 0,
          checkOutsToday: 0,
          openWorkOrders: 0,
          bookingsThisMonth: 0,
          revenueThisMonth: 0,
          subscribersThisMonth: 0,
          totalSubscribers: 0,
          averageRating: null,
          totalReviews: 0,
        };
      }

      const { data, error } = await supabase.functions.invoke('get-dashboard-stats', {
        body: { organization_id: organizationId },
      });

      if (error) {
        console.error('Error fetching dashboard stats:', error);
        throw new Error(error.message || 'Failed to fetch dashboard stats');
      }

      return data as DashboardStats;
    },
    enabled: !!organizationId,
    staleTime: 30000, // 30 seconds
    gcTime: 60000,
  });
};
