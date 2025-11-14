import React from 'react';
import { Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PropertyRatingHeaderProps {
  avgRating: number;
  totalReviews: number;
  showVerifiedBadge?: boolean;
}

const PropertyRatingHeader = ({ 
  avgRating, 
  totalReviews,
  showVerifiedBadge = true 
}: PropertyRatingHeaderProps) => {
  if (totalReviews === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-4xl font-bold text-foreground">
            {avgRating.toFixed(1)}
          </span>
          <Star className="w-8 h-8 text-yellow-500 fill-current" />
        </div>
        <div className="text-left">
          <p className="text-lg font-semibold text-foreground">
            {totalReviews} {totalReviews === 1 ? 'Review' : 'Reviews'}
          </p>
          {showVerifiedBadge && (
            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
              Verified from Airbnb
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyRatingHeader;
