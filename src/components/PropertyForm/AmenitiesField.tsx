
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { PropertyFormData } from './types';

interface AmenitiesFieldProps {
  form: UseFormReturn<PropertyFormData>;
  disabled?: boolean;
}

const AmenitiesField = ({ form, disabled = false }: AmenitiesFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="amenities"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Amenities</FormLabel>
          <FormControl>
            <Textarea 
              placeholder="WiFi, Pool, Kitchen, Parking, etc."
              disabled={disabled}
              {...field} 
            />
          </FormControl>
          <FormDescription>
            List the amenities available at this property
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default AmenitiesField;
