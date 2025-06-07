
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

interface PropertyFormProps {
  onSubmit: (data: PropertyFormData & { photos: File[]; selectedCoverIndex?: number }) => void;
  onCancel: () => void;
  initialData?: Partial<Property>;
  isEditing?: boolean;
}

const PropertyForm = ({ onSubmit, onCancel, initialData, isEditing = false }: PropertyFormProps) => {
  const [photos, setPhotos] = useState<File[]>([]);
  const [selectedCoverIndex, setSelectedCoverIndex] = useState<number>(0);

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
    onSubmit({ ...data, photos, selectedCoverIndex });
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
            <PhotoUploadSection
              photos={photos}
              onPhotosChange={setPhotos}
              isEditing={isEditing}
              existingImages={initialData?.images || []}
              selectedCoverIndex={selectedCoverIndex}
              onCoverSelect={setSelectedCoverIndex}
            />

            <PropertyDetailsForm form={form} />

            <BookingIntegrationSection form={form} />

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
