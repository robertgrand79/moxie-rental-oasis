import React, { useState } from 'react';
import { Property } from '@/types/property';
import { Button } from '@/components/ui/button';
import { Calendar, Star } from 'lucide-react';
import { useRatingMetrics } from '@/hooks/useRatingMetrics';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import GuestBookingWidget from '@/components/booking/GuestBookingWidget';

interface CompactBookingCardProps {
  property: Property;
}

const CompactBookingCard: React.FC<CompactBookingCardProps> = ({ property }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { metrics } = useRatingMetrics();
  
  const pricePerNight = property.price_per_night || 0;

  return (
    <div className="py-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left: Price and Rating */}
        <div className="flex items-center gap-6">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl md:text-3xl font-bold text-foreground">
              ${pricePerNight}
            </span>
            <span className="text-muted-foreground">/ night</span>
          </div>
          {metrics && metrics.totalReviews > 0 && (
            <div className="flex items-center gap-1.5 text-sm">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="font-semibold">{metrics.formattedRating}</span>
              <span className="text-muted-foreground">
                ({metrics.totalReviews} reviews)
              </span>
            </div>
          )}
        </div>

        {/* Center: Quick Info */}
        <div className="hidden md:flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Check-in:</span>
            <span className="font-medium">3:00 PM</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Check-out:</span>
            <span className="font-medium">11:00 AM</span>
          </div>
        </div>

        {/* Right: CTA Button */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="text-base md:text-lg px-8 font-semibold">
              Check Availability
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Book {property.title}</DialogTitle>
            </DialogHeader>
            <GuestBookingWidget 
              property={property} 
              onBookingComplete={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CompactBookingCard;
