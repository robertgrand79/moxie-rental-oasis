import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Users, Wifi, Car } from 'lucide-react';
import { Property } from '@/types/property';
import { generateAddressSlug } from '@/utils/addressSlug';
import { useNavigate } from 'react-router-dom';

interface FloatingBookingCardProps {
  property: Property;
  onBookingClick?: () => void;
}

const FloatingBookingCard = ({ property, onBookingClick }: FloatingBookingCardProps) => {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      
      // Show the card from the very beginning and keep it visible
      setIsVisible(true);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate transform for smooth following behavior
  const transform = `translateY(${Math.min(scrollY * 0.1, 100)}px)`;

  const handleBookNow = () => {
    if (onBookingClick) {
      onBookingClick();
    } else {
      // Navigate to direct booking page
      const slug = generateAddressSlug(property.location);
      navigate(`/book/${slug}`);
    }
  };

  return (
    <div 
      className={`fixed top-8 right-8 z-50 transition-all duration-500 ease-out ${
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
      } hidden lg:block`}
      style={{ transform }}
    >
      <Card className="w-80 backdrop-blur-xl bg-card/95 border-border shadow-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">
              Book Your Stay
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

          <Button 
            className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-gradient-from to-gradient-accent-from hover:from-gradient-from/90 hover:to-gradient-accent-from/90 shadow-lg"
            onClick={handleBookNow}
          >
            Check Availability
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Secure booking with instant confirmation
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
        </CardContent>
      </Card>
    </div>
  );
};

export default FloatingBookingCard;
