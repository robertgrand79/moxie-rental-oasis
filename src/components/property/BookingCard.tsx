
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Property } from '@/types/property';
import EmbeddedBookingModal from './EmbeddedBookingModal';

interface BookingCardProps {
  property: Property;
}

const BookingCard = ({ property }: BookingCardProps) => {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const hasBookingUrl = property.hospitable_booking_url && property.hospitable_booking_url.trim() !== '';

  const handleBookNow = () => {
    setIsBookingModalOpen(true);
  };

  return (
    <div className="lg:col-span-1">
      <Card className="sticky top-8">
        <CardHeader>
          <CardTitle className="text-2xl">
            ${property.price_per_night}
            <span className="text-lg font-normal text-gray-600">/night</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hasBookingUrl ? (
            <>
              <Button 
                className="w-full mb-4 bg-gradient-to-r from-gradient-from to-gradient-accent-from hover:from-gradient-from/90 hover:to-gradient-accent-from/90"
                onClick={handleBookNow}
              >
                Book Now
              </Button>
              <p className="text-sm text-gray-600 text-center">
                You won't be charged yet
              </p>
            </>
          ) : (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
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

      {hasBookingUrl && (
        <EmbeddedBookingModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          bookingUrl={property.hospitable_booking_url!}
          propertyTitle={property.title}
        />
      )}
    </div>
  );
};

export default BookingCard;
