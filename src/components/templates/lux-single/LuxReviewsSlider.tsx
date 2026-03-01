import React, { useState, useCallback } from 'react';
import { usePropertyReviews } from '@/hooks/usePropertyReviews';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useRatingMetrics } from '@/hooks/useRatingMetrics';

interface LuxReviewsSliderProps {
  propertyId: string;
}

const LuxReviewsSlider: React.FC<LuxReviewsSliderProps> = ({ propertyId }) => {
  const { reviews, isLoading } = usePropertyReviews(propertyId);
  const { metrics } = useRatingMetrics();
  const [current, setCurrent] = useState(0);

  const navigate = useCallback(
    (direction: 1 | -1) => {
      if (reviews.length === 0) return;
      setCurrent((prev) => (prev + direction + reviews.length) % reviews.length);
    },
    [reviews.length]
  );

  if (isLoading || reviews.length === 0) return null;

  const review = reviews[current];

  return (
    <section className="py-24 md:py-32 border-t border-border/30">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="flex items-center justify-between mb-16">
          <div>
            <p className="uppercase tracking-widest text-sm text-muted-foreground mb-2">
              Guest Reviews
            </p>
            {metrics && (
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-foreground text-foreground" />
                <span className="font-serif text-2xl text-foreground">
                  {metrics.formattedRating}
                </span>
                <span className="text-muted-foreground text-sm ml-1">
                  · {metrics.reviewText}
                </span>
              </div>
            )}
          </div>

          {/* Navigation arrows */}
          {reviews.length > 1 && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 border border-border/50 rounded-full text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                aria-label="Previous review"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => navigate(1)}
                className="p-2 border border-border/50 rounded-full text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                aria-label="Next review"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* Review quote */}
        <div className="max-w-4xl transition-opacity duration-500">
          <blockquote className="font-serif text-2xl md:text-3xl lg:text-4xl text-foreground leading-snug tracking-tight mb-8">
            "{review.review_text}"
          </blockquote>

          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-border/30 max-w-[60px]" />
            <div>
              <p className="text-foreground font-medium">{review.guest_name}</p>
              {review.guest_location && (
                <p className="text-muted-foreground text-sm">{review.guest_location}</p>
              )}
            </div>
          </div>
        </div>

        {/* Dot indicators */}
        {reviews.length > 1 && (
          <div className="flex items-center gap-2 mt-12">
            {reviews.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === current
                    ? 'w-8 bg-foreground'
                    : 'w-1.5 bg-border hover:bg-muted-foreground'
                }`}
                aria-label={`Go to review ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default LuxReviewsSlider;
