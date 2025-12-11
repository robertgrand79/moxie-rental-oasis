import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Event, useCreateEvent, useUpdateEvent } from '@/hooks/useEvents';
import { useAuth } from '@/contexts/AuthContext';
import { fetchWebsiteImage } from '@/lib/api/fetchWebsiteImage';
import { toast } from 'sonner';

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  category: z.string().optional(),
  event_date: z.string().min(1, 'Event date is required'),
  end_date: z.string().optional(),
  time_start: z.string().optional(),
  time_end: z.string().optional(),
  location: z.string().optional(),
  image_url: z.string().url().optional().or(z.literal('')),
  website_url: z.string().url().optional().or(z.literal('')),
  ticket_url: z.string().url().optional().or(z.literal('')),
  price_range: z.string().optional(),
  is_featured: z.boolean().default(false),
  is_recurring: z.boolean().default(false),
  recurrence_pattern: z.string().optional(),
  status: z.enum(['published', 'draft']).default('published'),
});

type EventFormData = z.infer<typeof eventSchema>;

interface EventFormProps {
  event?: Event | null;
  onClose: () => void;
}

const EventForm = ({ event, onClose }: EventFormProps) => {
  const { user } = useAuth();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const [isFetchingImage, setIsFetchingImage] = useState(false);

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: event?.title || '',
      description: event?.description || '',
      category: event?.category || '',
      event_date: event?.event_date || '',
      end_date: event?.end_date || '',
      time_start: event?.time_start || '',
      time_end: event?.time_end || '',
      location: event?.location || '',
      image_url: event?.image_url || '',
      website_url: event?.website_url || '',
      ticket_url: event?.ticket_url || '',
      price_range: event?.price_range || '',
      is_featured: event?.is_featured || false,
      is_recurring: event?.is_recurring || false,
      recurrence_pattern: event?.recurrence_pattern || '',
      status: event?.status || 'published',
    },
  });

  const onSubmit = (data: EventFormData) => {
    if (event) {
      updateEvent.mutate(
        { id: event.id, ...data },
        { onSuccess: onClose }
      );
    } else {
      createEvent.mutate(
        { 
          ...data, 
          title: data.title, 
          event_date: data.event_date, 
          created_by: user?.id || '', 
          status: data.status || 'published' 
        },
        { onSuccess: onClose }
      );
    }
  };

  const handleFetchImage = async () => {
    const websiteUrl = form.getValues('website_url');
    if (!websiteUrl) {
      toast.error('Please enter a website URL first');
      return;
    }

    setIsFetchingImage(true);
    try {
      const imageUrl = await fetchWebsiteImage(websiteUrl);
      form.setValue('image_url', imageUrl);
      toast.success('Image fetched and uploaded successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to fetch image');
    } finally {
      setIsFetchingImage(false);
    }
  };

  const categories = [
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'outdoor', label: 'Outdoor' },
    { value: 'dining', label: 'Dining' },
    { value: 'culture', label: 'Culture' },
    { value: 'sports', label: 'Sports' },
    { value: 'community', label: 'Community' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{event ? 'Edit Event' : 'Add New Event'}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter event title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter event description" 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Event location" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="event_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="time_start"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="time_end"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website URL</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleFetchImage}
                        disabled={isFetchingImage}
                        title="Fetch image from website"
                      >
                        {isFetchingImage ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="ticket_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ticket URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://tickets.example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price_range"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price Range</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Free, $10-20, $50+" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="is_featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Featured</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Featured event
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_recurring"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Recurring</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Recurring event
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createEvent.isPending || updateEvent.isPending}>
                  {event ? 'Update' : 'Create'} Event
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventForm;