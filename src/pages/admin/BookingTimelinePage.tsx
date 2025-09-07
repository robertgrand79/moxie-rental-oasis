import React from 'react';
import { BookingTimelineCalendar } from '@/components/booking/BookingTimelineCalendar';

const BookingTimelinePage = () => {
  const handleAddBooking = (propertyId: string, date: string) => {
    console.log('Add booking for property:', propertyId, 'on date:', date);
    // TODO: Open booking creation modal
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Calendar Overview</h1>
        <p className="text-muted-foreground">
          View and manage all property bookings in a timeline view
        </p>
      </div>
      
      <BookingTimelineCalendar onAddBooking={handleAddBooking} />
    </div>
  );
};

export default BookingTimelinePage;