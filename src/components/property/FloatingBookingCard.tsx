
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Users, Wifi, Car } from 'lucide-react';
import { Property } from '@/types/property';

interface FloatingBookingCardProps {
  property: Property;
}

const FloatingBookingCard = ({ property }: FloatingBookingCardProps) => {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsSticky(scrollTop > 400); // Start floating after hero section
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const hasBookingUrl = property.hospitable_booking_url && property.hospitable_booking_url.trim() !== '';

  return (
    <div 
      className={`transition-all duration-300 ${
        isSticky 
          ? 'fixed top-8 right-8 z-50 shadow-2xl' 
          : 'relative shadow-lg'
      }`}
    >
      <Card className="w-80 backdrop-blur-xl bg-white/95 border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-3xl font-bold">
              ${property.price_per_night}
              <span className="text-lg font-normal text-muted-foreground">/night</span>
            </CardTitle>
            <div className="flex items-center bg-muted rounded-full px-3 py-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
              <span className="font-semibold">4.8</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Quick Property Info */}
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="text-center p-2 bg-muted/50 rounded">
              <Users className="h-4 w-4 mx-auto mb-1 text-icon-emerald" />
              <div className="font-semibold">{property.max_guests}</div>
              <div className="text-xs text-muted-foreground">Guests</div>
            </div>
            <div className="text-center p-2 bg-muted/50 rounded">
              <Wifi className="h-4 w-4 mx-auto mb-1 text-icon-blue" />
              <div className="font-semibold">Free</div>
              <div className="text-xs text-muted-foreground">WiFi</div>
            </div>
            <div className="text-center p-2 bg-muted/50 rounded">
              <Car className="h-4 w-4 mx-auto mb-1 text-icon-purple" />
              <div className="font-semibold">Free</div>
              <div className="text-xs text-muted-foreground">Parking</div>
            </div>
          </div>

          {hasBookingUrl ? (
            <>
              <Button 
                className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-gradient-from to-gradient-accent-from hover:from-gradient-from/90 hover:to-gradient-accent-from/90 shadow-lg"
                onClick={() => {
                  window.open(property.hospitable_booking_url, '_blank');
                }}
              >
                Book Now
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                You won't be charged yet
              </p>
              
              {/* Booking Benefits */}
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Instant booking confirmation
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  24/7 customer support
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Flexible cancellation
                </div>
              </div>
            </>
          ) : (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Booking information will be available soon
              </p>
              <Button 
                variant="outline" 
                className="w-full"
                disabled
              >
                Booking Coming Soon
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FloatingBookingCard;
