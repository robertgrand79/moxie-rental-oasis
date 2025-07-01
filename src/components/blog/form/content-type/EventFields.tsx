
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CONTENT_TYPE_CATEGORIES } from '@/types/blogPost';
import { ExtendedBlogFormData } from '@/hooks/useBlogForm';

interface EventFieldsProps {
  form: UseFormReturn<ExtendedBlogFormData>;
}

const EventFields = ({ form }: EventFieldsProps) => {
  const { register, setValue, watch, formState: { errors } } = form;
  const watchedValues = watch();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📅 Event Details
        </CardTitle>
        <CardDescription>
          Event-specific information and scheduling
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category">Event Category</Label>
            <Select value={watchedValues.category} onValueChange={(value) => setValue('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CONTENT_TYPE_CATEGORIES.event.map((cat) => (
                  <SelectItem key={cat} value={cat.toLowerCase()}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="location">Location *</Label>
            <Input {...register('location', { required: 'Location is required for events' })} />
            {errors.location && <p className="text-sm text-red-500">{errors.location.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="event_date">Event Date *</Label>
            <Input
              type="date"
              {...register('event_date', { required: 'Event date is required' })}
            />
            {errors.event_date && <p className="text-sm text-red-500">{errors.event_date.message}</p>}
          </div>
          
          <div>
            <Label htmlFor="end_date">End Date (if multi-day)</Label>
            <Input type="date" {...register('end_date')} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="time_start">Start Time</Label>
            <Input type="time" {...register('time_start')} />
          </div>
          
          <div>
            <Label htmlFor="time_end">End Time</Label>
            <Input type="time" {...register('time_end')} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price_range">Price Range</Label>
            <Input {...register('price_range')} placeholder="e.g., $15-25, Free" />
          </div>
          
          <div>
            <Label htmlFor="ticket_url">Ticket URL</Label>
            <Input {...register('ticket_url')} placeholder="https://..." />
          </div>
        </div>

        <div>
          <Label htmlFor="address">Full Address</Label>
          <Textarea {...register('address')} placeholder="Complete address for the event venue" />
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_recurring"
            checked={watchedValues.is_recurring}
            onCheckedChange={(checked) => setValue('is_recurring', checked as boolean)}
          />
          <Label htmlFor="is_recurring">Recurring Event</Label>
        </div>

        {watchedValues.is_recurring && (
          <div>
            <Label htmlFor="recurrence_pattern">Recurrence Pattern</Label>
            <Input {...register('recurrence_pattern')} placeholder="e.g., Weekly on Fridays, Monthly first Saturday" />
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Checkbox
            id="is_featured"
            checked={watchedValues.is_featured}
            onCheckedChange={(checked) => setValue('is_featured', checked as boolean)}
          />
          <Label htmlFor="is_featured">Featured Event</Label>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventFields;
