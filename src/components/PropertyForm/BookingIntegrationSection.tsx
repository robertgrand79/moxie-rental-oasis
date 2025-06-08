
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { PropertyFormData } from './types';

interface BookingIntegrationSectionProps {
  form: UseFormReturn<PropertyFormData>;
}

const BookingIntegrationSection = ({ form }: BookingIntegrationSectionProps) => {
  const hospitableBookingUrl = form.watch('hospitableBookingUrl');
  const hasValidUrl = hospitableBookingUrl && hospitableBookingUrl.trim() !== '';

  return (
    <>
      {/* Hospitable Booking Integration */}
      <FormField
        control={form.control}
        name="hospitableBookingUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Hospitable Booking URL (Optional)</FormLabel>
            <FormControl>
              <Input 
                placeholder="https://booking.hospitable.com/widget/your-widget-id/property-id"
                {...field} 
              />
            </FormControl>
            <FormDescription>
              Enter the full Hospitable booking widget URL for this property. You can add this later if you don't have it yet.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Booking Preview - Only show if there's a valid URL */}
      {hasValidUrl && (
        <div className="space-y-2">
          <FormLabel>Booking Widget Preview</FormLabel>
          <div className="border rounded-lg overflow-hidden">
            <iframe
              src={hospitableBookingUrl}
              style={{ width: '100%', height: '400px' }}
              frameBorder="0"
              sandbox="allow-top-navigation allow-scripts allow-same-origin"
              title="Hospitable Booking Widget Preview"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default BookingIntegrationSection;
