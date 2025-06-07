import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Upload, X, Image } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Property } from '@/types/property';

const propertySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  location: z.string().min(1, 'Location is required'),
  bedrooms: z.number().min(1, 'At least 1 bedroom required'),
  bathrooms: z.number().min(1, 'At least 1 bathroom required'),
  maxGuests: z.number().min(1, 'At least 1 guest capacity required'),
  pricePerNight: z.number().min(1, 'Price must be greater than 0'),
  hospitableBookingUrl: z.string().url('Valid Hospitable booking URL required'),
  amenities: z.string().optional(),
});

type PropertyFormData = z.infer<typeof propertySchema>;

interface PropertyFormProps {
  onSubmit: (data: PropertyFormData & { photos: File[] }) => void;
  onCancel: () => void;
  initialData?: Partial<Property>;
  isEditing?: boolean;
}

const PropertyForm = ({ onSubmit, onCancel, initialData, isEditing = false }: PropertyFormProps) => {
  const [photos, setPhotos] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      location: initialData?.location || '',
      bedrooms: initialData?.bedrooms || 1,
      bathrooms: initialData?.bathrooms || 1,
      maxGuests: initialData?.maxGuests || 2,
      pricePerNight: initialData?.pricePerNight || 100,
      hospitableBookingUrl: initialData?.hospitableBookingUrl || '',
      amenities: initialData?.amenities || '',
    },
  });

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      addPhotos(imageFiles);
    }
  }, []);

  const addPhotos = (newFiles: File[]) => {
    setPhotos(prev => [...prev, ...newFiles]);
    
    // Create preview URLs
    newFiles.forEach(file => {
      const url = URL.createObjectURL(file);
      setPreviewUrls(prev => [...prev, url]);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => {
      const newUrls = prev.filter((_, i) => i !== index);
      // Revoke the removed URL to prevent memory leaks
      URL.revokeObjectURL(prev[index]);
      return newUrls;
    });
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    if (imageFiles.length > 0) {
      addPhotos(imageFiles);
    }
  };

  const handleSubmit = (data: PropertyFormData) => {
    onSubmit({ ...data, photos });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Property' : 'Add New Property'}</CardTitle>
        <CardDescription>
          {isEditing ? 'Update your vacation rental listing details' : 'Create a new vacation rental listing with photos and booking integration'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Photo Upload Section - only show if not editing or if no existing image */}
            {(!isEditing || !initialData?.imageUrl) && (
              <div className="space-y-4">
                <FormLabel>Property Photos</FormLabel>
                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                    dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
                    "hover:border-primary hover:bg-primary/5"
                  )}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Drag and drop photos here</p>
                    <p className="text-xs text-muted-foreground">or click to select files</p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileInput}
                      className="hidden"
                      id="photo-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('photo-upload')?.click()}
                    >
                      Choose Files
                    </Button>
                  </div>
                </div>
                
                {/* Photo Previews */}
                {previewUrls.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removePhoto(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Show existing image if editing */}
            {isEditing && initialData?.imageUrl && (
              <div className="space-y-2">
                <FormLabel>Current Property Image</FormLabel>
                <div className="relative w-48 h-32">
                  <img
                    src={initialData.imageUrl}
                    alt="Current property"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Upload new photos above to replace the current image
                </p>
              </div>
            )}

            {/* Property Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Beautiful Beachfront Villa" {...field} />
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
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Malibu, CA" {...field} />
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
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your property, its features, and what makes it special..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="bedrooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bedrooms</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
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
                name="bathrooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bathrooms</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
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
                name="maxGuests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Guests</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
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
                name="pricePerNight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price per Night ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 100)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="amenities"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amenities</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="WiFi, Pool, Kitchen, Parking, etc."
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

            {/* Form Actions */}
            <div className="flex gap-4 pt-6">
              <Button type="submit" className="flex-1">
                {isEditing ? 'Update Property' : 'Save Property'}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default PropertyForm;
