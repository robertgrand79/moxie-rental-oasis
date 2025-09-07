
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Property } from '@/types/property';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import GuestBookingWidget from '@/components/booking/GuestBookingWidget';

interface BookingCardProps {
  property: Property;
}

const BookingCard = ({ property }: BookingCardProps) => {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const handleBookNow = () => {
    setIsBookingModalOpen(true);
  };

  const handleBookingComplete = (reservationId: string) => {
    setIsBookingModalOpen(false);
    // Could show success message
  };

  return (
    <div className="lg:col-span-1">
      <Card className="sticky top-8">
        <CardHeader>
          <CardTitle className="text-2xl">
            Book Your Stay
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            className="w-full mb-4 bg-gradient-to-r from-gradient-from to-gradient-accent-from hover:from-gradient-from/90 hover:to-gradient-accent-from/90"
            onClick={handleBookNow}
          >
            Check Availability & Book
          </Button>
          <p className="text-sm text-gray-600 text-center mb-4">
            Secure booking with instant confirmation
          </p>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Free cancellation available
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Best price guarantee
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              24/7 support
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Book {property.title}</DialogTitle>
          </DialogHeader>
          <GuestBookingWidget 
            property={property} 
            onBookingComplete={handleBookingComplete}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingCard;
