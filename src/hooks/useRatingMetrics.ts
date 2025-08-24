import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface RatingMetrics {
  averageRating: number;
  totalReviews: number;
  formattedRating: string;
  reviewText: string;
}

export const useRatingMetrics = () => {
  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['rating-metrics'],
    queryFn: async (): Promise<RatingMetrics> => {
      console.log('🔄 Fetching rating metrics...');
      const { data, error } = await supabase
        .from('testimonials')
        .select('rating')
        .eq('is_active', true)
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
  });

  return {
    metrics,
    isLoading,
    error
  };
};