
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Phone, MessageCircle } from 'lucide-react';
import { Property } from '@/types/property';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobileBookingBarProps {
  property: Property;
  onBookingClick?: () => void;
}

const MobileBookingBar = ({ property, onBookingClick }: MobileBookingBarProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const isMobile = useIsMobile();
  
  const hasBookingUrl = property.hospitable_booking_url && property.hospitable_booking_url.trim() !== '';

  if (!isMobile) return null;

  const handleBookNow = () => {
    if (onBookingClick) {
      onBookingClick();
    }
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 p-4 transition-transform duration-300 ${
      isVisible ? 'translate-y-0' : 'translate-y-full'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="text-lg font-bold text-gray-900">
            ${property.price_per_night}
            <span className="text-sm font-normal text-gray-600">/night</span>
          </div>
          <div className="text-xs text-gray-500">
            Free cancellation
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Contact Buttons */}
          <Button
            variant="outline"
            size="sm"
            className="flex items-center space-x-1"
          >
            <Phone className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="flex items-center space-x-1"
          >
            <MessageCircle className="h-4 w-4" />
          </Button>
          
          {/* Main Booking Button */}
          {hasBookingUrl ? (
            <Button 
              onClick={handleBookNow}
              className="bg-primary hover:bg-primary/90 px-6"
            >
              Book Now
            </Button>
          ) : (
            <Button 
              variant="outline"
              disabled
              className="px-6"
            >
              Coming Soon
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileBookingBar;
