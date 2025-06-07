
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface PropertyFormData {
  title: string;
  description: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  pricePerNight: number;
  hospitableBookingUrl: string;
  amenities?: string;
}

interface BookingIntegrationSectionProps {
  form: UseFormReturn<PropertyFormData>;
}

const BookingIntegrationSection = ({ form }: BookingIntegrationSectionProps) => {
  return (
    <>
      {/* Hospitable Booking Integration */}
      <FormField
        control={form.control}
        name="hospitableBookingUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Hospitable Booking URL</FormLabel>
            <FormControl>
              <Input 
                placeholder="https://booking.hospitable.com/widget/your-widget-id/property-id"
                {...field} 
              />
            </FormControl>
            <FormDescription>
              Enter the full Hospitable booking widget URL for this property
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Booking Preview */}
      {form.watch('hospitableBookingUrl') && (
        <div className="space-y-2">
          <FormLabel>Booking Widget Preview</FormLabel>
          <div className="border rounded-lg overflow-hidden">
            <iframe
              src={form.watch('hospitableBookingUrl')}
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
