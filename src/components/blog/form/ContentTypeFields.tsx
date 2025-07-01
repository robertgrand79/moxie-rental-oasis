import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ContentType, CONTENT_TYPE_CATEGORIES } from '@/types/blogPost';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExtendedBlogFormData } from '@/hooks/useBlogForm';

interface ContentTypeFieldsProps {
  form: UseFormReturn<ExtendedBlogFormData>;
  contentType: ContentType;
}

const ContentTypeFields = ({ form, contentType }: ContentTypeFieldsProps) => {
  const { register, setValue, watch, formState: { errors } } = form;
  const watchedValues = watch();

  if (contentType === 'article') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📝 Article Settings
          </CardTitle>
          <CardDescription>
            Standard blog article configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={watchedValues.category} onValueChange={(value) => setValue('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_TYPE_CATEGORIES.article.map((cat) => (
                    <SelectItem key={cat} value={cat.toLowerCase()}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="display_order">Display Order</Label>
              <Input
                type="number"
                {...register('display_order', { valueAsNumber: true })}
                placeholder="0"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_featured"
              checked={watchedValues.is_featured}
              onCheckedChange={(checked) => setValue('is_featured', checked as boolean)}
            />
            <Label htmlFor="is_featured">Featured content</Label>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (contentType === 'event') {
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
  }

  if (contentType === 'poi') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📍 Point of Interest Details
          </CardTitle>
          <CardDescription>
            Location and business information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">POI Category</Label>
              <Select value={watchedValues.category} onValueChange={(value) => setValue('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_TYPE_CATEGORIES.poi.map((cat) => (
                    <SelectItem key={cat} value={cat.toLowerCase()}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="location">Location Name *</Label>
              <Input {...register('location', { required: 'Location name is required' })} />
              {errors.location && <p className="text-sm text-red-500">{errors.location.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="address">Full Address *</Label>
            <Textarea {...register('address', { required: 'Address is required for POI' })} />
            {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                type="number"
                step="any"
                {...register('latitude', { valueAsNumber: true })}
                placeholder="44.0521"
              />
            </div>
            
            <div>
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                type="number"
                step="any"
                {...register('longitude', { valueAsNumber: true })}
                placeholder="-123.0868"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input {...register('phone')} placeholder="(541) 555-0123" />
            </div>
            
            <div>
              <Label htmlFor="website_url">Website URL</Label>
              <Input {...register('website_url')} placeholder="https://..." />
            </div>
          </div>

          <div>
            <Label htmlFor="rating">Rating (1-5)</Label>
            <Input
              type="number"
              min="1"
              max="5"
              step="0.1"
              {...register('rating', { valueAsNumber: true })}
              placeholder="4.5"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_featured"
              checked={watchedValues.is_featured}
              onCheckedChange={(checked) => setValue('is_featured', checked as boolean)}
            />
            <Label htmlFor="is_featured">Featured POI</Label>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (contentType === 'lifestyle') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🎨 Lifestyle Content Details
          </CardTitle>
          <CardDescription>
            Activity and experience information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Lifestyle Category</Label>
              <Select value={watchedValues.category} onValueChange={(value) => setValue('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_TYPE_CATEGORIES.lifestyle.map((cat) => (
                    <SelectItem key={cat} value={cat.toLowerCase()}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="activity_type">Activity Type *</Label>
              <Input {...register('activity_type', { required: 'Activity type is required' })} />
              {errors.activity_type && <p className="text-sm text-red-500">{errors.activity_type.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="location">Location (if applicable)</Label>
            <Input {...register('location')} placeholder="Eugene, Oregon" />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_featured"
              checked={watchedValues.is_featured}
              onCheckedChange={(checked) => setValue('is_featured', checked as boolean)}
            />
            <Label htmlFor="is_featured">Featured Lifestyle Content</Label>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default ContentTypeFields;
