
import React from 'react';
import { Property } from '@/types/property';
import GuestBookingWidget from '@/components/booking/GuestBookingWidget';

interface IntegratedBookingSectionProps {
  property: Property;
}

const IntegratedBookingSection = ({ property }: IntegratedBookingSectionProps) => {
  const handleBookingComplete = (reservationId: string) => {
    console.log('Booking completed:', reservationId);
  };

  return (
    <div className="bg-muted/30 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center space-y-2">
          <h1 className="text-3xl font-bold">Complete Your Reservation</h1>
          <p className="text-muted-foreground">Secure booking powered by Moxie Vacation Rentals</p>
        </div>
        
        <GuestBookingWidget 
          property={property} 
          onBookingComplete={handleBookingComplete}
        />
      </div>
    </div>
  );
};

export default IntegratedBookingSection;
