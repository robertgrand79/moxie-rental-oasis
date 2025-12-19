import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Place, useCreatePlace, useUpdatePlace } from '@/hooks/usePlaces';
import { usePlaceCategories } from '@/hooks/usePlaceCategories';
import { useAuth } from '@/contexts/AuthContext';
import PlaceImageUpload from './PlaceImageUpload';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
const placeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  address: z.string().optional(),
  location_text: z.string().optional(),
  phone: z.string().optional(),
  website_url: z.string().url().optional().or(z.literal('')),
  rating: z.number().min(0).max(5).optional(),
  price_level: z.number().min(1).max(4).optional(),
  image_url: z.string().url().optional().or(z.literal('')),
  activity_type: z.string().optional(),
  is_featured: z.boolean().default(false),
  status: z.enum(['published', 'draft']).default('published'),
  display_order: z.number().default(0),
  // POI-specific fields
  distance_from_properties: z.number().optional(),
  walking_time: z.number().optional(),
  driving_time: z.number().optional(),
  show_on_map: z.boolean().default(true),
});

type PlaceFormData = z.infer<typeof placeSchema>;

interface PlaceFormProps {
  place?: Place | null;
  onClose: () => void;
}

const PlaceForm = ({ place, onClose }: PlaceFormProps) => {
  const { user } = useAuth();
  const createPlace = useCreatePlace();
  const updatePlace = useUpdatePlace();
  const { categories, isLoading: categoriesLoading } = usePlaceCategories();
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [coordinates, setCoordinates] = useState<{ latitude: number | null; longitude: number | null }>({
    latitude: place?.latitude || null,
    longitude: place?.longitude || null,
  });

  const form = useForm<PlaceFormData>({
    resolver: zodResolver(placeSchema),
    defaultValues: {
      name: place?.name || '',
      description: place?.description || '',
      category: place?.category || '',
      subcategory: place?.subcategory || '',
      address: place?.address || '',
      location_text: place?.location_text || '',
      phone: place?.phone || '',
      website_url: place?.website_url || '',
      rating: place?.rating || 0,
      price_level: place?.price_level || 1,
      image_url: place?.image_url || '',
      activity_type: place?.activity_type || '',
      is_featured: place?.is_featured || false,
      status: place?.status || 'published',
      display_order: place?.display_order || 0,
      distance_from_properties: place?.distance_from_properties || undefined,
      walking_time: place?.walking_time || undefined,
      driving_time: place?.driving_time || undefined,
      show_on_map: place?.show_on_map !== false,
    },
  });

  // Reset form when place data changes (for edit mode)
  useEffect(() => {
    if (place) {
      form.reset({
        name: place.name || '',
        description: place.description || '',
        category: place.category || '',
        subcategory: place.subcategory || '',
        address: place.address || '',
        location_text: place.location_text || '',
        phone: place.phone || '',
        website_url: place.website_url || '',
        rating: place.rating || 0,
        price_level: place.price_level || 1,
        image_url: place.image_url || '',
        activity_type: place.activity_type || '',
        is_featured: place.is_featured || false,
        status: place.status || 'published',
        display_order: place.display_order || 0,
        distance_from_properties: place.distance_from_properties || undefined,
        walking_time: place.walking_time || undefined,
        driving_time: place.driving_time || undefined,
        show_on_map: place.show_on_map !== false,
      });
      setCoordinates({
        latitude: place.latitude || null,
        longitude: place.longitude || null,
      });
    }
  }, [place, form]);

  const handleGeocode = async () => {
    const address = form.getValues('address');
    if (!address) {
      toast.error('Please enter an address first');
      return;
    }

    setIsGeocoding(true);
    try {
      const { data, error } = await supabase.functions.invoke('geocode-address', {
        body: { address, placeId: place?.id },
      });

      if (error) throw error;

      if (data.latitude && data.longitude) {
        setCoordinates({ latitude: data.latitude, longitude: data.longitude });
        toast.success(`Coordinates found: ${data.latitude.toFixed(6)}, ${data.longitude.toFixed(6)}`);
      } else {
        toast.error('Could not geocode address');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      toast.error('Failed to geocode address');
    } finally {
      setIsGeocoding(false);
    }
  };

  const onSubmit = (data: PlaceFormData) => {
    // Include coordinates in the submission
    const dataWithCoords = {
      ...data,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
    };

    if (place) {
      updatePlace.mutate(
        { id: place.id, ...dataWithCoords },
        { onSuccess: onClose }
      );
    } else {
      createPlace.mutate(
        { 
          ...dataWithCoords, 
          name: data.name, 
          category: data.category, 
          created_by: user?.id || '', 
          status: data.status || 'published' 
        },
        { onSuccess: onClose }
      );
    }
  };

  // Categories are now fetched dynamically from the database

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{place ? 'Edit Place' : 'Add New Place'}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter place name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={categoriesLoading}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={categoriesLoading ? "Loading..." : "Select category"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.slug} value={category.slug}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter place description" 
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
                  name="subcategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subcategory</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Restaurant, Brewery" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="activity_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Activity Type</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Hiking, Wine Tasting" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input placeholder="Enter full address" {...field} />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={handleGeocode}
                          disabled={isGeocoding || !field.value}
                          title="Geocode address"
                        >
                          {isGeocoding ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MapPin className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <FormDescription>
                        Click the map pin to get coordinates
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location_text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location Description</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Downtown Eugene" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Coordinates Display */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Latitude</label>
                  <Input 
                    value={coordinates.latitude?.toFixed(6) || ''} 
                    placeholder="Not set"
                    readOnly
                    className="bg-muted"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Longitude</label>
                  <Input 
                    value={coordinates.longitude?.toFixed(6) || ''} 
                    placeholder="Not set"
                    readOnly
                    className="bg-muted"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="(555) 123-4567" {...field} />
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
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} />
                      </FormControl>
                      <FormDescription>Used to auto-fetch place image</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <PlaceImageUpload
                currentImageUrl={form.watch('image_url') || ''}
                websiteUrl={form.watch('website_url') || ''}
                onImageChange={(url) => form.setValue('image_url', url)}
                disabled={createPlace.isPending || updatePlace.isPending}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rating (0-5)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          max="5" 
                          step="0.1"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price Level (1-4)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          max="4"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="display_order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Order</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="is_featured"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Featured Place</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Mark as featured place
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
                  name="show_on_map"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Show on Experiences Map</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Display on the public map
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
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="walking_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Walking Time (min)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="e.g., 10"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="driving_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Driving Time (min)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="e.g., 5"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="distance_from_properties"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Distance (miles)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          step="0.1"
                          placeholder="e.g., 1.5"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createPlace.isPending || updatePlace.isPending}>
                  {place ? 'Update' : 'Create'} Place
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlaceForm;