import React, { useState } from 'react';
import { usePropertyReviews } from '@/hooks/usePropertyReviews';
import PropertyRatingHeader from './PropertyRatingHeader';
import TestimonialCard from '@/components/ui/testimonial-card';
import LoadingState from '@/components/ui/loading-state';
import { Button } from '@/components/ui/button';
import { Star, Quote, ChevronDown, ChevronUp } from 'lucide-react';
import { debug } from '@/utils/debug';

interface PropertyReviewsSectionProps {
  propertyId: string;
}

const PropertyReviewsSection = ({ propertyId }: PropertyReviewsSectionProps) => {
  const { reviews, metrics, isLoading, loadMore, hasMore } = usePropertyReviews(propertyId);
  const [showAllReviews, setShowAllReviews] = useState(false);

  debug.log('[Reviews]', '🎨 PropertyReviewsSection render:', {
    propertyId,
    reviewsCount: reviews.length,
    metrics,
    isLoading
  });

  if (isLoading && reviews.length === 0) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <LoadingState variant="card" message="Loading reviews..." />
        </div>
      </section>
    );
  }

  if (!metrics || metrics.totalReviews === 0) {
    return null; // Hide section if no reviews
  }

  const getRatingPercentage = (count: number) => {
    return metrics.totalReviews > 0 
      ? Math.round((count / metrics.totalReviews) * 100) 
      : 0;
  };

  // Featured review (highest rated or first)
  const featuredReview = reviews.find(r => r.rating === 5) || reviews[0];
  const otherReviews = reviews.filter(r => r.id !== featuredReview?.id);
  
  // Show 3 reviews initially, all when expanded
  const displayedReviews = showAllReviews ? otherReviews : otherReviews.slice(0, 3);

  return (
    <section className="py-16 bg-background" id="reviews">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Compact Header with Rating */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                What Guests Are Saying
              </h2>
              <p className="text-muted-foreground">
                {metrics.totalReviews} verified guest {metrics.totalReviews === 1 ? 'review' : 'reviews'}
              </p>
            </div>
            
            {/* Large Rating Display */}
            <div className="flex items-center gap-4 bg-muted/50 rounded-2xl p-4 px-6">
              <div className="text-5xl font-bold text-foreground">
                {metrics.avgRating.toFixed(1)}
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= Math.round(metrics.avgRating)
                          ? 'text-yellow-500 fill-current'
                          : 'text-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  Based on {metrics.totalReviews} reviews
                </span>
              </div>
            </div>
          </div>

          {/* Rating Distribution - Compact horizontal */}
          <div className="grid grid-cols-5 gap-2 mb-10 max-w-xl">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = stars === 5 ? metrics.fiveStar : 
                           stars === 4 ? metrics.fourStar :
                           stars === 3 ? metrics.threeStar :
                           stars === 2 ? metrics.twoStar : metrics.oneStar;
              const percentage = getRatingPercentage(count);
              return (
                <div key={stars} className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-0.5 text-sm font-medium">
                    {stars}<Star className="h-3 w-3 text-yellow-500 fill-current" />
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-500 transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{count}</span>
                </div>
              );
            })}
          </div>

          {/* Featured Review - Highlight */}
          {featuredReview && (
            <div className="mb-10 p-6 md:p-8 bg-gradient-to-br from-primary/5 via-background to-primary/5 rounded-2xl border border-primary/10 relative overflow-hidden">
              <Quote className="absolute top-4 right-4 h-16 w-16 text-primary/10" />
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= (featuredReview.rating || 5)
                        ? 'text-yellow-500 fill-current'
                        : 'text-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
              <blockquote className="text-xl md:text-2xl font-medium text-foreground mb-6 leading-relaxed relative z-10">
                "{featuredReview.review_text}"
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg">
                  {featuredReview.guest_name?.charAt(0) || 'G'}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{featuredReview.guest_name}</p>
                  {featuredReview.guest_location && (
                    <p className="text-sm text-muted-foreground">{featuredReview.guest_location}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Other Reviews Grid */}
          {displayedReviews.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedReviews.map((review) => (
                <TestimonialCard key={review.id} testimonial={review} />
              ))}
            </div>
          )}

          {/* Show More / Show Less */}
          {otherReviews.length > 3 && (
            <div className="text-center mt-8">
              <Button
                onClick={() => setShowAllReviews(!showAllReviews)}
                variant="outline"
                size="lg"
                className="min-w-[200px]"
              >
                {showAllReviews ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-2" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-2" />
                    Show All {otherReviews.length + 1} Reviews
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Load More from Server */}
          {hasMore && showAllReviews && (
            <div className="text-center mt-6">
              <Button
                onClick={loadMore}
                variant="ghost"
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PropertyReviewsSection;
