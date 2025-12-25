import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { PropertyFormData } from './types';

interface BasicInfoFieldsProps {
  form: UseFormReturn<PropertyFormData>;
  disabled?: boolean;
}

const BasicInfoFields = ({ form, disabled = false }: BasicInfoFieldsProps) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input 
                  placeholder="Beautiful Beachfront Villa" 
                  disabled={disabled} 
                  enableAI={!disabled}
                  aiLabel="Property Title"
                  aiPrompt="Generate an attractive vacation rental property title that highlights unique features. Make it memorable and appealing to potential guests."
                  aiTooltip="Generate title with AI"
                  value={field.value}
                  onChange={field.onChange}
                  onValueChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Property Address</FormLabel>
              <FormControl>
                <Input placeholder="123 Main Street, Eugene, OR 97401" disabled={disabled} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Textarea 
                placeholder="Describe your property, its features, and what makes it special..."
                className="min-h-[100px]"
                disabled={disabled}
                enableAI={!disabled}
                aiLabel="Description"
                aiPrompt="Write a compelling vacation rental property description highlighting comfort, amenities, location appeal, and what makes this property special. Include key selling points and create an inviting atmosphere."
                aiTooltip="Generate description with AI"
                value={field.value}
                onChange={field.onChange}
                onValueChange={field.onChange}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default BasicInfoFields;
