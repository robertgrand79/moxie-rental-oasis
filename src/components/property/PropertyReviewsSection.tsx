import React from 'react';
import { usePropertyReviews } from '@/hooks/usePropertyReviews';
import PropertyRatingHeader from './PropertyRatingHeader';
import TestimonialCard from '@/components/ui/testimonial-card';
import LoadingState from '@/components/ui/loading-state';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { debug } from '@/utils/debug';

interface PropertyReviewsSectionProps {
  propertyId: string;
}

const PropertyReviewsSection = ({ propertyId }: PropertyReviewsSectionProps) => {
  const { reviews, metrics, isLoading, loadMore, hasMore } = usePropertyReviews(propertyId);

  debug.log('[Reviews]', '🎨 PropertyReviewsSection render:', {
    propertyId,
    reviewsCount: reviews.length,
    metrics,
    isLoading
  });

  if (isLoading && reviews.length === 0) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <LoadingState variant="card" message="Loading reviews..." />
        </div>
      </section>
    );
  }

  if (!metrics || metrics.totalReviews === 0) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No reviews yet. Be the first to review this property!
            </p>
          </div>
        </div>
      </section>
    );
  }

  const getRatingPercentage = (count: number) => {
    return metrics.totalReviews > 0 
      ? Math.round((count / metrics.totalReviews) * 100) 
      : 0;
  };

  return (
    <section className="py-16 bg-background" id="reviews">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Guest Reviews
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real experiences from real guests who've stayed at this property
          </p>
        </div>

        {/* Rating Summary */}
        <div className="max-w-4xl mx-auto mb-12">
          <PropertyRatingHeader 
            avgRating={metrics.avgRating}
            totalReviews={metrics.totalReviews}
          />

          {/* Rating Distribution */}
          <div className="space-y-3 mt-8">
            {[
              { stars: 5, count: metrics.fiveStar },
              { stars: 4, count: metrics.fourStar },
              { stars: 3, count: metrics.threeStar },
              { stars: 2, count: metrics.twoStar },
              { stars: 1, count: metrics.oneStar },
            ].map(({ stars, count }) => {
              const percentage = getRatingPercentage(count);
              return (
                <div key={stars} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-20">
                    <span className="text-sm font-medium text-foreground">{stars}</span>
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  </div>
                  <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-500 transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-16 text-right">
                    {count} ({percentage}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {reviews.map((review) => (
            <TestimonialCard key={review.id} testimonial={review} />
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="text-center mt-12">
            <Button
              onClick={loadMore}
              variant="outline"
              size="lg"
              disabled={isLoading}
              className="min-w-[200px]"
            >
              {isLoading ? 'Loading...' : 'Load More Reviews'}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default PropertyReviewsSection;
