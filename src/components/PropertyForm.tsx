
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Property } from '@/types/property';
import PhotoUploadSection from './PropertyForm/PhotoUploadSection';
import PropertyDetailsForm from './PropertyForm/PropertyDetailsForm';
import BookingIntegrationSection from './PropertyForm/BookingIntegrationSection';
import { PropertyFormData } from './PropertyForm/types';
import { usePhotoUpload } from '@/hooks/usePhotoUpload';
import { Loader2 } from 'lucide-react';

const propertySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  location: z.string().min(1, 'Location is required'),
  bedrooms: z.number().min(1, 'At least 1 bedroom required'),
  bathrooms: z.number().min(1, 'At least 1 bathroom required'),
  maxGuests: z.number().min(1, 'At least 1 guest capacity required'),
  pricePerNight: z.number().min(1, 'Price must be greater than 0'),
  hospitableBookingUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  amenities: z.string().optional(),
});

interface PropertyFormProps {
  onSubmit: (data: PropertyFormData & { photos: File[]; reorderedExistingImages?: string[]; featuredPhotos?: string[]; deletedImages?: string[] }) => void;
  onCancel: () => void;
  initialData?: Partial<Property>;
  isEditing?: boolean;
  isSubmitting?: boolean;
}

const PropertyForm = ({ onSubmit, onCancel, initialData, isEditing = false, isSubmitting = false }: PropertyFormProps) => {
  const [photos, setPhotos] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(initialData?.images || []);
  const [featuredPhotos, setFeaturedPhotos] = useState<string[]>(initialData?.featured_photos || []);
  const [deletedImages, setDeletedImages] = useState<string[]>([]);
  const { uploading } = usePhotoUpload();

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      location: initialData?.location || '',
      bedrooms: initialData?.bedrooms || 1,
      bathrooms: initialData?.bathrooms || 1,
      maxGuests: initialData?.max_guests || 2,
      pricePerNight: initialData?.price_per_night || 100,
      hospitableBookingUrl: initialData?.hospitable_booking_url || '',
      amenities: initialData?.amenities || '',
    },
  });

  const handleSubmit = (data: PropertyFormData) => {
    if (isSubmitting) {
      console.log('⚠️ [FORM] Form already submitting, ignoring duplicate submission');
      return;
    }
    
    console.log('📝 [FORM] Form submission started with data:', {
      ...data,
      photosCount: photos.length,
      existingImagesCount: existingImages.length,
      featuredPhotosCount: featuredPhotos.length,
      deletedImagesCount: deletedImages.length
    });
    
    onSubmit({ 
      ...data, 
      photos, 
      reorderedExistingImages: existingImages,
      featuredPhotos,
      deletedImages
    });
  };

  const handleExistingImagesReorder = (newOrder: string[]) => {
    console.log('Reordering existing images:', newOrder);
    setExistingImages(newOrder);
  };

  const isProcessing = isSubmitting || uploading;

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Property' : 'Add New Property'}
        </CardTitle>
        <CardDescription className="text-gray-600">
          {isEditing ? 'Update your vacation rental listing details' : 'Create a new vacation rental listing with photos and booking integration'}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            <PhotoUploadSection
              photos={photos}
              onPhotosChange={setPhotos}
              isEditing={isEditing}
              existingImages={existingImages}
              onExistingImagesReorder={handleExistingImagesReorder}
              featuredPhotos={featuredPhotos}
              onFeaturedPhotosChange={setFeaturedPhotos}
              onDeletedImagesChange={setDeletedImages}
              disabled={isProcessing}
            />

            <PropertyDetailsForm form={form} disabled={isProcessing} />

            <BookingIntegrationSection form={form} disabled={isProcessing} />

            {isProcessing && (
              <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg border">
                <Loader2 className="h-5 w-5 animate-spin mr-3 text-primary" />
                <span className="text-gray-700 font-medium">
                  {uploading ? 'Uploading photos...' : 'Saving property...'}
                </span>
              </div>
            )}

            <div className="flex gap-4 pt-6 border-t">
              <Button 
                type="submit" 
                className="flex-1 h-12 text-lg font-semibold"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    {uploading ? 'Uploading...' : 'Saving...'}
                  </>
                ) : (
                  isEditing ? 'Update Property' : 'Save Property'
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={isProcessing}
                className="px-8 h-12 text-lg font-semibold"
              >
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
