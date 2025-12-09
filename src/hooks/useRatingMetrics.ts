import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';

export interface RatingMetrics {
  averageRating: number;
  totalReviews: number;
  formattedRating: string;
  reviewText: string;
}

export const useRatingMetrics = () => {
  const { tenantId } = useTenant();

  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['rating-metrics', tenantId],
    queryFn: async (): Promise<RatingMetrics> => {
      if (!tenantId) {
        return {
          averageRating: 0,
          totalReviews: 0,
          formattedRating: '0.0',
          reviewText: '0 Reviews'
        };
      }

      console.log('🔄 Fetching rating metrics for tenant:', tenantId);
      
      // Query testimonials that belong to tenant's properties
      const { data, error } = await supabase
        .from('testimonials')
        .select(`
          rating,
          properties!inner(organization_id)
        `)
        .eq('is_active', true)
        .eq('properties.organization_id', tenantId)
        .not('rating', 'is', null);
      
      if (error) {
        console.error('❌ Error fetching rating metrics:', error);
        throw error;
      }

      const totalReviews = data?.length || 0;
      const averageRating = totalReviews > 0 
        ? data.reduce((sum, item) => sum + item.rating, 0) / totalReviews 
        : 0;

      const formattedRating = averageRating.toFixed(1);
      const reviewText = totalReviews >= 100 
        ? `${Math.floor(totalReviews / 10) * 10}+ Reviews`
        : `${totalReviews} Reviews`;

      console.log('✅ Rating metrics calculated:', { averageRating, totalReviews });

      return {
        averageRating,
        totalReviews,
        formattedRating,
        reviewText
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!tenantId
  });

  return {
    metrics,
    isLoading,
    error
  };
};
