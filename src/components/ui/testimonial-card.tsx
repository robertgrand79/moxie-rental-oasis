import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Calendar } from 'lucide-react';
import OptimizedImage from '@/components/ui/optimized-image';
import { format } from 'date-fns';

interface TestimonialCardProps {
  testimonial: {
    id: string;
    guest_name: string;
    guest_location?: string;
    guest_avatar_url?: string;
    rating: number;
    content?: string;
    review_text?: string;
    property_name?: string;
    stay_date?: string;
    booking_platform?: string;
  };
}

const TestimonialCard = ({ testimonial }: TestimonialCardProps) => {
  const reviewText = testimonial.content || testimonial.review_text || '';
  const platformColor = {
    airbnb: 'bg-red-100 text-red-800 border-red-200',
    booking: 'bg-blue-100 text-blue-800 border-blue-200',
    direct: 'bg-green-100 text-green-800 border-green-200',
    vrbo: 'bg-purple-100 text-purple-800 border-purple-200',
  }[testimonial.booking_platform?.toLowerCase() || 'direct'] || 'bg-gray-100 text-gray-800 border-gray-200';

  const formatStayDate = (dateStr?: string) => {
    if (!dateStr) return null;
    try {
      return format(new Date(dateStr), 'MMM yyyy');
    } catch {
      return dateStr;
    }
  };

  return (
    <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <OptimizedImage
              src={testimonial.guest_avatar_url || '/placeholder-avatar.png'}
              alt={testimonial.guest_name}
              className="w-12 h-12 rounded-full object-cover border-2 border-border/20"
              fallbackIcon={true}
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-lg truncate">
                {testimonial.guest_name}
              </h3>
              {testimonial.guest_location && (
                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{testimonial.guest_location}</span>
                </div>
              )}
            </div>
          </div>
          
          {testimonial.booking_platform && (
            <Badge variant="outline" className={platformColor}>
              {testimonial.booking_platform.charAt(0).toUpperCase() + testimonial.booking_platform.slice(1)}
            </Badge>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < testimonial.rating
                  ? 'text-yellow-500 fill-current'
                  : 'text-muted-foreground/30'
              }`}
            />
          ))}
          <span className="text-sm text-muted-foreground ml-1">
            ({testimonial.rating}/5)
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Property Info */}
        {testimonial.property_name && (
          <div className="mb-4 p-3 bg-muted/30 rounded-lg border border-border/30">
            <div className="font-medium text-foreground text-sm">
              {testimonial.property_name}
            </div>
            {testimonial.stay_date && (
              <div className="flex items-center gap-1 text-muted-foreground text-xs mt-1">
                <Calendar className="w-3 h-3" />
                <span>Stayed {formatStayDate(testimonial.stay_date)}</span>
              </div>
            )}
          </div>
        )}

        {/* Review Text */}
        <div className="text-muted-foreground text-sm leading-relaxed">
          <p className="line-clamp-4">
            "{reviewText}"
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestimonialCard;