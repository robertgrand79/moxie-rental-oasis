
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { PropertyFormData } from './types';

interface PropertySpecsFieldsProps {
  form: UseFormReturn<PropertyFormData>;
}

const PropertySpecsFields = ({ form }: PropertySpecsFieldsProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <FormField
        control={form.control}
        name="bedrooms"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bedrooms</FormLabel>
            <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select bedrooms" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="1">1 Bedroom</SelectItem>
                <SelectItem value="2">2 Bedrooms</SelectItem>
                <SelectItem value="3">3 Bedrooms</SelectItem>
                <SelectItem value="4">4 Bedrooms</SelectItem>
                <SelectItem value="5">5 Bedrooms</SelectItem>
                <SelectItem value="6">6+ Bedrooms</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="bathrooms"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Bathrooms</FormLabel>
            <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select bathrooms" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="1">1 Bathroom</SelectItem>
                <SelectItem value="2">2 Bathrooms</SelectItem>
                <SelectItem value="3">3 Bathrooms</SelectItem>
                <SelectItem value="4">4 Bathrooms</SelectItem>
                <SelectItem value="5">5+ Bathrooms</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="maxGuests"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Max Guests</FormLabel>
            <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select guests" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="1">1 Guest</SelectItem>
                <SelectItem value="2">2 Guests</SelectItem>
                <SelectItem value="3">3 Guests</SelectItem>
                <SelectItem value="4">4 Guests</SelectItem>
                <SelectItem value="5">5 Guests</SelectItem>
                <SelectItem value="6">6 Guests</SelectItem>
                <SelectItem value="7">7 Guests</SelectItem>
                <SelectItem value="8">8 Guests</SelectItem>
                <SelectItem value="9">9 Guests</SelectItem>
                <SelectItem value="10">10+ Guests</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="pricePerNight"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Price per Night ($)</FormLabel>
            <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select price" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="50">$50 - $99</SelectItem>
                <SelectItem value="100">$100 - $149</SelectItem>
                <SelectItem value="150">$150 - $199</SelectItem>
                <SelectItem value="200">$200 - $249</SelectItem>
                <SelectItem value="250">$250 - $299</SelectItem>
                <SelectItem value="300">$300 - $349</SelectItem>
                <SelectItem value="350">$350 - $399</SelectItem>
                <SelectItem value="400">$400 - $499</SelectItem>
                <SelectItem value="500">$500+</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default PropertySpecsFields;
