import React from 'react';
import { X, Edit, Star, MapPin, Calendar, Building, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Testimonial } from '@/hooks/useTestimonials';

interface ReviewDetailPanelProps {
  testimonial: Testimonial;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}

const ReviewDetailPanel = ({ testimonial, isOpen, onClose, onEdit }: ReviewDetailPanelProps) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`h-5 w-5 ${
              i <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-muted-foreground/30'
            }`}
          />
        ))}
        <span className="ml-2 font-medium">{rating}/5</span>
      </div>
    );
  };

  const getPlatformBadgeStyle = (platform?: string) => {
    switch (platform?.toLowerCase()) {
      case 'airbnb':
        return 'bg-[#FF5A5F]/10 text-[#FF5A5F] border-[#FF5A5F]/20';
      case 'vrbo':
        return 'bg-[#3662D8]/10 text-[#3662D8] border-[#3662D8]/20';
      default:
        return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              {testimonial.is_active !== false ? (
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-200">
                  Active
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-muted text-muted-foreground">
                  Inactive
                </Badge>
              )}
              {testimonial.is_featured && (
                <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-200">
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  Featured
                </Badge>
              )}
              {testimonial.booking_platform && (
                <Badge variant="outline" className={getPlatformBadgeStyle(testimonial.booking_platform)}>
                  {testimonial.booking_platform.charAt(0).toUpperCase() + testimonial.booking_platform.slice(1)}
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <SheetTitle className="text-xl text-left">Review Details</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Guest Info */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={testimonial.guest_avatar_url} />
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-medium">
                {getInitials(testimonial.guest_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">{testimonial.guest_name}</h3>
              {testimonial.guest_location && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 mr-1" />
                  {testimonial.guest_location}
                </div>
              )}
            </div>
          </div>

          {/* Rating */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Rating</h4>
            {renderStars(testimonial.rating)}
          </div>

          <Separator />

          {/* Review Content */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Review</h4>
            <p className="text-sm leading-relaxed">
              {testimonial.review_text || testimonial.content || 'No review text provided.'}
            </p>
          </div>

          <Separator />

          {/* Property & Stay Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Stay Details</h4>
            
            {testimonial.property_name && (
              <div className="flex items-center gap-3">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{testimonial.property_name}</span>
              </div>
            )}
            
            {testimonial.stay_date && (
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {new Date(testimonial.stay_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            )}
          </div>

          <Separator />

          {/* Meta Info */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Details</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-muted-foreground">Display Order</div>
              <div>{testimonial.display_order ?? 0}</div>
              <div className="text-muted-foreground">Created</div>
              <div>{new Date(testimonial.created_at).toLocaleDateString()}</div>
              <div className="text-muted-foreground">Updated</div>
              <div>{new Date(testimonial.updated_at).toLocaleDateString()}</div>
            </div>
          </div>

          {/* Edit Button */}
          <div className="pt-4">
            <Button onClick={onEdit} className="w-full">
              <Edit className="h-4 w-4 mr-2" />
              Edit Review
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ReviewDetailPanel;
