import React, { useState } from 'react';
import { BookingTimelineCalendar } from '@/components/booking/BookingTimelineCalendar';
import { PricingCalendarView } from '@/components/booking/PricingCalendarView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, LayoutGrid } from 'lucide-react';

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
          View and manage all property bookings and pricing
        </p>
      </div>
      
      <Tabs defaultValue="pricing" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="pricing" className="gap-2">
            <LayoutGrid className="h-4 w-4" />
            Pricing Calendar
          </TabsTrigger>
          <TabsTrigger value="timeline" className="gap-2">
            <CalendarDays className="h-4 w-4" />
            Timeline View
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pricing" className="mt-6">
          <PricingCalendarView onAddBooking={handleAddBooking} />
        </TabsContent>
        
        <TabsContent value="timeline" className="mt-6">
          <BookingTimelineCalendar onAddBooking={handleAddBooking} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BookingTimelinePage;