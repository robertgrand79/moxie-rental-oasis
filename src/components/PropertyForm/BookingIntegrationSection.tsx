
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { PropertyFormData } from './types';

interface BookingIntegrationSectionProps {
  form: UseFormReturn<PropertyFormData>;
  disabled?: boolean;
}

const BookingIntegrationSection = ({ form, disabled = false }: BookingIntegrationSectionProps) => {
  return (
    <>
      {/* Airbnb Listing Integration */}
      <FormField
        control={form.control}
        name="airbnbListingUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Airbnb Listing URL (Optional)</FormLabel>
            <FormControl>
              <Input 
                placeholder="https://www.airbnb.com/rooms/12345678"
                disabled={disabled}
                {...field} 
              />
            </FormControl>
            <FormDescription>
              Enter the Airbnb listing URL for this property. This will be used to sync guest reviews automatically.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default BookingIntegrationSection;
