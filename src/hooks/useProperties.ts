
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Property } from '@/types/property';
import { usePhotoUpload } from './usePhotoUpload';

const initialProperties: Property[] = [
  {
    id: 'harris-st',
    title: 'Charming Eugene Home on Harris Street',
    description: 'Beautiful home in a quiet neighborhood, perfect for families or groups visiting Eugene.',
    location: '2920 Harris St. Eugene OR 97405',
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 6,
    pricePerNight: 180,
    imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
    hospitableBookingUrl: 'https://booking.hospitable.com/widget/9f173de9-769e-4b7b-b861-57ccb4ab07c2/harris-st',
    amenities: 'WiFi, Kitchen, Parking, Quiet Neighborhood'
  },
  {
    id: 'kincaid-st',
    title: 'Modern Kincaid Street Retreat',
    description: 'Contemporary home with modern amenities in a desirable Eugene location.',
    location: '2614 Kincaid St. Eugene OR 97405',
    bedrooms: 2,
    bathrooms: 2,
    maxGuests: 4,
    pricePerNight: 160,
    imageUrl: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80',
    hospitableBookingUrl: 'https://booking.hospitable.com/widget/9f173de9-769e-4b7b-b861-57ccb4ab07c2/kincaid-st',
    amenities: 'WiFi, Modern Amenities, Kitchen, Parking'
  },
  {
    id: 'w-10th-house',
    title: 'Downtown Eugene House on 10th Street',
    description: 'Spacious downtown Eugene home within walking distance of restaurants and shops.',
    location: '358 W 10th St. Eugene OR 97401',
    bedrooms: 4,
    bathrooms: 3,
    maxGuests: 8,
    pricePerNight: 220,
    imageUrl: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=80',
    hospitableBookingUrl: 'https://booking.hospitable.com/widget/9f173de9-769e-4b7b-b861-57ccb4ab07c2/w-10th-house',
    amenities: 'WiFi, Downtown Location, Kitchen, Walking Distance to Restaurants'
  },
  {
    id: 'w-10th-studio',
    title: 'Cozy Downtown Studio on 10th Street',
    description: 'Modern studio apartment in the heart of downtown Eugene.',
    location: '358 W 10th Studio Eugene OR 97401',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    pricePerNight: 120,
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
    hospitableBookingUrl: 'https://booking.hospitable.com/widget/9f173de9-769e-4b7b-b861-57ccb4ab07c2/w-10th-studio',
    amenities: 'WiFi, Downtown Location, Modern Studio, Kitchen'
  },
  {
    id: 'woodlawn-ave',
    title: 'Elegant Woodlawn Avenue Home',
    description: 'Beautiful home in a tree-lined neighborhood offering comfort and tranquility.',
    location: '1885 Woodlawn Ave Eugene OR 97403',
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 6,
    pricePerNight: 190,
    imageUrl: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=800&q=80',
    hospitableBookingUrl: 'https://booking.hospitable.com/widget/9f173de9-769e-4b7b-b861-57ccb4ab07c2/woodlawn-ave',
    amenities: 'WiFi, Tree-lined Neighborhood, Kitchen, Parking, Tranquil Setting'
  }
];

export const useProperties = () => {
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const { toast } = useToast();
  const { uploadPhotos } = usePhotoUpload();

  const addProperty = async (data: any) => {
    console.log('Property form submitted:', data);
    
    const propertyId = Date.now().toString();
    let imageUrl = '/placeholder.svg';

    // Upload photos if any were provided
    if (data.photos && data.photos.length > 0) {
      console.log('Uploading photos for new property:', data.photos.length);
      const uploadedUrls = await uploadPhotos(data.photos, propertyId);
      if (uploadedUrls.length > 0) {
        imageUrl = uploadedUrls[0]; // Use the first uploaded image as the main image
        console.log('Using uploaded image as main:', imageUrl);
      }
    }

    const newProperty: Property = {
      id: propertyId,
      title: data.title,
      description: data.description,
      location: data.location,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      maxGuests: data.maxGuests,
      pricePerNight: data.pricePerNight,
      hospitableBookingUrl: data.hospitableBookingUrl,
      amenities: data.amenities,
      imageUrl
    };

    setProperties(prev => [...prev, newProperty]);
    
    toast({
      title: "Property Added",
      description: "Your property has been successfully added to the listings.",
    });
  };

  const editProperty = async (id: string, data: any) => {
    console.log('Edit property:', id, data);
    
    let imageUrl: string | undefined;

    // Upload new photos if any were provided
    if (data.photos && data.photos.length > 0) {
      console.log('Uploading photos for existing property:', data.photos.length);
      const uploadedUrls = await uploadPhotos(data.photos, id);
      if (uploadedUrls.length > 0) {
        imageUrl = uploadedUrls[0]; // Use the first uploaded image as the main image
        console.log('Using uploaded image as main:', imageUrl);
      }
    }
    
    setProperties(prev => prev.map(property => 
      property.id === id 
        ? {
            ...property,
            title: data.title,
            description: data.description,
            location: data.location,
            bedrooms: data.bedrooms,
            bathrooms: data.bathrooms,
            maxGuests: data.maxGuests,
            pricePerNight: data.pricePerNight,
            hospitableBookingUrl: data.hospitableBookingUrl,
            amenities: data.amenities,
            // Only update imageUrl if new photos were uploaded
            ...(imageUrl && { imageUrl })
          }
        : property
    ));
    
    toast({
      title: "Property Updated",
      description: "Your property has been successfully updated.",
    });
  };

  const deleteProperty = (id: string) => {
    setProperties(properties.filter(prop => prop.id !== id));
    toast({
      title: "Property Deleted",
      description: "The property has been removed from your listings.",
    });
  };

  return {
    properties,
    addProperty,
    editProperty,
    deleteProperty
  };
};
