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
      
      // Step 1: Get property IDs for this tenant
      const { data: properties, error: propsError } = await supabase
        .from('properties')
        .select('id')
        .eq('organization_id', tenantId);
      
      if (propsError) {
        console.error('❌ Error fetching properties:', propsError);
        throw propsError;
      }

      const propertyIds = properties?.map(p => p.id) || [];
      
      if (propertyIds.length === 0) {
        return {
          averageRating: 0,
          totalReviews: 0,
          formattedRating: '0.0',
          reviewText: '0 Reviews'
        };
      }

      // Step 2: Fetch testimonials for those properties
      const { data, error } = await supabase
        .from('testimonials')
        .select('rating')
        .in('property_id', propertyIds)
        .eq('is_active', true)
        .not('rating', 'is', null);
      
      if (error) {
        console.error('❌ Error fetching rating metrics:', error);
        throw error;
      }

      const totalReviews = data?.length || 0;
      const averageRating = totalReviews > 0 
        ? data.reduce((sum, item) => sum + (item.rating || 0), 0) / totalReviews 
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
