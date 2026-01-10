import React, { useState } from 'react';
import { Property } from '@/types/property';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Star, ChevronDown } from 'lucide-react';
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
    <Card className="sticky top-24 shadow-xl border-border/50 overflow-hidden">
      <CardContent className="p-6 space-y-6">
        {/* Price and Rating Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-foreground">
                ${pricePerNight}
              </span>
              <span className="text-muted-foreground">/ night</span>
            </div>
          </div>
          {metrics && metrics.totalReviews > 0 && (
            <div className="flex items-center gap-1.5 text-sm">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="font-semibold">{metrics.formattedRating}</span>
              <span className="text-muted-foreground">
                ({metrics.totalReviews})
              </span>
            </div>
          )}
        </div>

        {/* Quick Info */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground text-xs">Check-in</p>
              <p className="font-medium">3:00 PM</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-muted-foreground text-xs">Check-out</p>
              <p className="font-medium">11:00 AM</p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="w-full text-lg py-6 font-semibold">
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

        {/* Trust indicators */}
        <div className="text-center space-y-2">
          <p className="text-xs text-muted-foreground">
            You won't be charged yet
          </p>
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span>✓ Free cancellation</span>
            <span>✓ Secure payment</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompactBookingCard;
