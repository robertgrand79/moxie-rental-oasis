
import React from 'react';
import { Property } from '@/types/property';
import GuestBookingWidget from '@/components/booking/GuestBookingWidget';

interface IntegratedBookingSectionProps {
  property: Property;
}

const IntegratedBookingSection = ({ property }: IntegratedBookingSectionProps) => {
  const handleBookingComplete = (reservationId: string) => {
    // Handle successful booking
    console.log('Booking completed:', reservationId);
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 min-h-[80vh]">
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gray-900">Complete Your Reservation</h2>
          <p className="text-gray-600">Secure booking powered by Moxie Vacation Rentals</p>
        </div>
      </div>
      
      <div className="p-6">
        <GuestBookingWidget 
          property={property} 
          onBookingComplete={handleBookingComplete}
        />
      </div>
    </div>
  );
};

export default IntegratedBookingSection;
