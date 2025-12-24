import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Property } from '@/types/property';
import PhotoUploadSection from './PropertyForm/PhotoUploadSection';
import PropertyDetailsForm from './PropertyForm/PropertyDetailsForm';
import BookingIntegrationSection from './PropertyForm/BookingIntegrationSection';
import { PropertyFormData } from './PropertyForm/types';
import { useOptimizedPhotoUpload } from '@/hooks/useOptimizedPhotoUpload';
import { Loader2, FileText, Image, Calendar, Home, Wrench, DollarSign, Receipt, Tag } from 'lucide-react';
import BookingIntegrationManager from '@/components/admin/properties/BookingIntegrationManager';
import TurnoPropertyMapping from './PropertyForm/TurnoPropertyMapping';
import { SmartHomeManager } from '@/components/smart-home/SmartHomeManager';
import { PropertyFeesManager } from './PropertyForm/PropertyFeesManager';
import { PropertyTaxManager } from '@/components/admin/properties/PropertyTaxManager';
import { LengthOfStayDiscounts } from '@/components/admin/properties/LengthOfStayDiscounts';
import { PromotionalCodesManager } from '@/components/admin/properties/PromotionalCodesManager';
import { FormErrorBoundary } from '@/components/error-boundaries/FormErrorBoundary';

const propertySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  location: z.string().min(1, 'Location is required'),
  bedrooms: z.number().min(1, 'At least 1 bedroom required'),
  bathrooms: z.number().min(1, 'At least 1 bathroom required'),
  maxGuests: z.number().min(1, 'At least 1 guest capacity required'),
  pricePerNight: z.number().min(1, 'Price must be greater than 0'),
  airbnbListingUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  amenities: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

interface PropertyFormProps {
  onSubmit: (data: PropertyFormData & { photos: File[]; reorderedExistingImages?: string[]; featuredPhotos?: string[]; deletedImages?: string[] }, stayOnPage?: boolean) => void;
  onCancel: () => void;
  initialData?: Partial<Property>;
  isEditing?: boolean;
  isSubmitting?: boolean;
}

const PropertyForm = ({ onSubmit, onCancel, initialData, isEditing = false, isSubmitting = false }: PropertyFormProps) => {
  const [photos, setPhotos] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(initialData?.images || []);
  const [featuredPhotos, setFeaturedPhotos] = useState<string[]>(
    (initialData?.featured_photos || []).filter(url => !url.startsWith('blob:'))
  );
  const [deletedImages, setDeletedImages] = useState<string[]>([]);
  const { uploading, uploadProgress, optimizationStats } = useOptimizedPhotoUpload();

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
      airbnbListingUrl: initialData?.airbnb_listing_url || '',
      amenities: initialData?.amenities || '',
      latitude: initialData?.latitude || undefined,
      longitude: initialData?.longitude || undefined,
    },
  });

  const [saveAndContinue, setSaveAndContinue] = useState(false);

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
      deletedImagesCount: deletedImages.length,
      stayOnPage: saveAndContinue
    });
    
    onSubmit({ 
      ...data, 
      photos, 
      reorderedExistingImages: existingImages,
      featuredPhotos,
      deletedImages
    }, saveAndContinue);
    
    // Reset the flag after submission
    setSaveAndContinue(false);
  };

  const handleSaveAndContinue = () => {
    setSaveAndContinue(true);
    form.handleSubmit(handleSubmit)();
  };

  const handleExistingImagesReorder = (newOrder: string[]) => {
    console.log('Reordering existing images:', newOrder);
    setExistingImages(newOrder);
  };

  const isProcessing = isSubmitting || uploading;
  const [activeTab, setActiveTab] = useState('details');

  return (
    <FormErrorBoundary formName="Property Form" onReset={onCancel}>
    <Card className="w-full max-w-5xl mx-auto">
      <CardHeader className="text-center pb-6">
        <CardTitle className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Property' : 'Add New Property'}
        </CardTitle>
        <CardDescription className="text-gray-600">
          {isEditing ? 'Update your vacation rental listing with all details and integrations' : 'Create a new vacation rental listing with photos and integrations'}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="overflow-x-auto -mx-2 px-2 pb-2">
                <TabsList className="inline-flex w-auto min-w-full sm:grid sm:grid-cols-8 gap-1">
                  <TabsTrigger value="details" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap min-h-[44px]">
                    <FileText className="h-4 w-4" />
                    <span className="hidden xs:inline sm:inline">Details</span>
                  </TabsTrigger>
                  <TabsTrigger value="photos" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap min-h-[44px]">
                    <Image className="h-4 w-4" />
                    <span className="hidden xs:inline sm:inline">Photos</span>
                  </TabsTrigger>
                  <TabsTrigger value="booking" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap min-h-[44px]" disabled={!isEditing}>
                    <Calendar className="h-4 w-4" />
                    <span className="hidden xs:inline sm:inline">Booking</span>
                  </TabsTrigger>
                  <TabsTrigger value="fees" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap min-h-[44px]" disabled={!isEditing}>
                    <DollarSign className="h-4 w-4" />
                    <span className="hidden xs:inline sm:inline">Fees</span>
                  </TabsTrigger>
                  <TabsTrigger value="taxes" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap min-h-[44px]" disabled={!isEditing}>
                    <Receipt className="h-4 w-4" />
                    <span className="hidden xs:inline sm:inline">Taxes</span>
                  </TabsTrigger>
                  <TabsTrigger value="discounts" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap min-h-[44px]" disabled={!isEditing}>
                    <Tag className="h-4 w-4" />
                    <span className="hidden xs:inline sm:inline">Discounts</span>
                  </TabsTrigger>
                  <TabsTrigger value="smart-home" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap min-h-[44px]" disabled={!isEditing}>
                    <Home className="h-4 w-4" />
                    <span className="hidden xs:inline sm:inline">Smart</span>
                  </TabsTrigger>
                  <TabsTrigger value="turno" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm whitespace-nowrap min-h-[44px]" disabled={!isEditing}>
                    <Wrench className="h-4 w-4" />
                    <span className="hidden xs:inline sm:inline">Turno</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="details" className="space-y-6 mt-6">
                <PropertyDetailsForm form={form} disabled={isProcessing} />
                <BookingIntegrationSection form={form} disabled={isProcessing} />
              </TabsContent>

              <TabsContent value="photos" className="space-y-6 mt-6">
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
              </TabsContent>

              {isEditing && initialData && (
                <>
                  <TabsContent value="booking" className="space-y-6 mt-6">
                    <BookingIntegrationManager property={initialData as Property} />
                  </TabsContent>

                  <TabsContent value="fees" className="space-y-6 mt-6">
                    <PropertyFeesManager property={initialData as Property} />
                  </TabsContent>

                  <TabsContent value="taxes" className="space-y-6 mt-6">
                    <PropertyTaxManager 
                      propertyId={(initialData as Property).id} 
                      organizationId={(initialData as Property).organization_id} 
                    />
                  </TabsContent>

                  <TabsContent value="discounts" className="space-y-6 mt-6">
                    <LengthOfStayDiscounts propertyId={(initialData as Property).id} />
                    <PromotionalCodesManager 
                      organizationId={(initialData as Property).organization_id}
                      propertyId={(initialData as Property).id}
                    />
                  </TabsContent>

                  <TabsContent value="smart-home" className="space-y-6 mt-6">
                    <SmartHomeManager property={initialData as Property} />
                  </TabsContent>

                  <TabsContent value="turno" className="space-y-6 mt-6">
                    <TurnoPropertyMapping property={initialData as Property} />
                  </TabsContent>
                </>
              )}
            </Tabs>

            {isProcessing && (
              <div className="space-y-4 p-6 bg-gray-50 rounded-lg border">
                <div className="flex items-center justify-center">
                  <Loader2 className="h-5 w-5 animate-spin mr-3 text-primary" />
                  <span className="text-gray-700 font-medium">
                    {uploading ? 'Optimizing & uploading photos...' : 'Saving property...'}
                  </span>
                </div>
                
                {/* Upload progress for individual files */}
                {uploadProgress.length > 0 && (
                  <div className="space-y-2">
                    {uploadProgress.map((progress, index) => (
                      <div key={progress.fileName} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="truncate">{progress.fileName}</span>
                          <span className="text-gray-500">
                            {progress.optimizing ? 'Optimizing...' : 
                             progress.uploading ? 'Uploading...' : 
                             progress.progress === 100 ? 'Complete' : 'Pending'}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress.progress}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Optimization stats */}
                {optimizationStats.totalSaved > 0 && (
                  <div className="text-sm text-gray-600 text-center">
                    💚 Saved {Math.round(optimizationStats.totalSaved / 1024)}KB 
                    ({optimizationStats.averageReduction}% smaller files)
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-6 border-t">
              {isEditing && (
                <Button 
                  type="button"
                  variant="secondary"
                  onClick={handleSaveAndContinue}
                  disabled={isProcessing}
                  className="h-12 text-base font-semibold"
                >
                  {isProcessing && saveAndContinue ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    'Save & Continue'
                  )}
                </Button>
              )}
              <Button 
                type="submit" 
                className="flex-1 h-12 text-base font-semibold"
                disabled={isProcessing}
              >
                {isProcessing && !saveAndContinue ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    {uploading ? 'Uploading...' : 'Saving...'}
                  </>
                ) : (
                  isEditing ? 'Save & Close' : 'Save Property'
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                disabled={isProcessing}
                className="px-6 h-12 text-base font-semibold"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
    </FormErrorBoundary>
  );
};

export default PropertyForm;
