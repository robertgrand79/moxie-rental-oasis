import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';

interface PropertyReviewMetrics {
  avgRating: number;
  totalReviews: number;
  fiveStar: number;
  fourStar: number;
  threeStar: number;
  twoStar: number;
  oneStar: number;
}

interface Review {
  id: string;
  guest_name: string;
  guest_location?: string;
  guest_avatar_url?: string;
  rating: number;
  review_text?: string;
  content?: string;
  property_name?: string;
  stay_date?: string;
  booking_platform?: string;
  created_at: string;
}

const REVIEWS_PER_PAGE = 6;

export const usePropertyReviews = (propertyId: string) => {
  const [page, setPage] = useState(1);
  const [allReviews, setAllReviews] = useState<Review[]>([]);

  // Reset when property changes
  useEffect(() => {
    setPage(1);
    setAllReviews([]);
  }, [propertyId]);

  // Fetch reviews for current page
  const { data: reviewsData, isLoading: reviewsLoading } = useQuery({
    queryKey: ['property-reviews', propertyId, page],
    queryFn: async () => {
      console.log('🔍 Fetching reviews for property:', propertyId, 'page:', page);
      const from = (page - 1) * REVIEWS_PER_PAGE;
      const to = from + REVIEWS_PER_PAGE - 1;

      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('property_id', propertyId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) {
        console.error('❌ Error fetching reviews:', error);
        throw error;
      }
      console.log('✅ Reviews data received:', data?.length || 0, 'reviews');
      return data || [];
    },
  });

  // Fetch aggregate metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['property-review-metrics', propertyId],
    queryFn: async () => {
      console.log('📊 Fetching review metrics for property:', propertyId);
      const { data, error } = await supabase
        .from('testimonials')
        .select('rating')
        .eq('property_id', propertyId)
        .eq('is_active', true);

      if (error) {
        console.error('❌ Error fetching metrics:', error);
        throw error;
      }

      const reviews = data || [];
      const totalReviews = reviews.length;
      console.log('📈 Total reviews found:', totalReviews);
      
      if (totalReviews === 0) {
        return {
          avgRating: 0,
          totalReviews: 0,
          fiveStar: 0,
          fourStar: 0,
          threeStar: 0,
          twoStar: 0,
          oneStar: 0,
        } as PropertyReviewMetrics;
      }

      const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
      const avgRating = sum / totalReviews;

      const fiveStar = reviews.filter(r => r.rating === 5).length;
      const fourStar = reviews.filter(r => r.rating === 4).length;
      const threeStar = reviews.filter(r => r.rating === 3).length;
      const twoStar = reviews.filter(r => r.rating === 2).length;
      const oneStar = reviews.filter(r => r.rating === 1).length;

      const metricsResult = {
        avgRating,
        totalReviews,
        fiveStar,
        fourStar,
        threeStar,
        twoStar,
        oneStar,
      } as PropertyReviewMetrics;
      
      console.log('📊 Metrics calculated:', metricsResult);
      return metricsResult;
    },
  });

  // Update all reviews when new page data arrives
  useEffect(() => {
    if (reviewsData && reviewsData.length > 0) {
      const newIds = new Set(reviewsData.map(r => r.id));
      const existingIds = new Set(allReviews.map(r => r.id));
      const hasNewReviews = reviewsData.some(r => !existingIds.has(r.id));
      
      if (hasNewReviews) {
        setAllReviews(prev => [...prev, ...reviewsData.filter(r => !existingIds.has(r.id))]);
      }
    }
  }, [reviewsData]);

  const hasMore = reviewsData && reviewsData.length === REVIEWS_PER_PAGE;

  const loadMore = () => {
    if (hasMore) {
      setPage(prev => prev + 1);
    }
  };

  return {
    reviews: allReviews,
    metrics,
    isLoading: reviewsLoading || metricsLoading,
    loadMore,
    hasMore: !!hasMore,
  };
};
