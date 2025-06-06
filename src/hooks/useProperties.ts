
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Property } from '@/types/property';

const initialProperties: Property[] = [
  {
    id: '1',
    title: 'Beachfront Villa',
    description: 'Stunning oceanview villa with private beach access',
    location: 'Malibu, CA',
    bedrooms: 4,
    bathrooms: 3,
    maxGuests: 8,
    pricePerNight: 450,
    imageUrl: '/placeholder.svg',
    hospitableBookingUrl: 'https://booking.hospitable.com/widget/9f173de9-769e-4b7b-b861-57ccb4ab07c2/1045550',
    amenities: 'WiFi, Pool, Private Beach, Kitchen, Parking'
  },
  {
    id: '2',
    title: 'Mountain Cabin Retreat',
    description: 'Cozy cabin nestled in the mountains with hiking trails',
    location: 'Aspen, CO',
    bedrooms: 2,
    bathrooms: 2,
    maxGuests: 4,
    pricePerNight: 280,
    imageUrl: '/placeholder.svg',
    hospitableBookingUrl: 'https://booking.hospitable.com/widget/9f173de9-769e-4b7b-b861-57ccb4ab07c2/1045551',
    amenities: 'WiFi, Fireplace, Kitchen, Hiking Access'
  }
];

export const useProperties = () => {
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const { toast } = useToast();

  const addProperty = (data: any) => {
    console.log('Property form submitted:', data);
    
    const newProperty: Property = {
      id: Date.now().toString(),
      title: data.title,
      description: data.description,
      location: data.location,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      maxGuests: data.maxGuests,
      pricePerNight: data.pricePerNight,
      hospitableBookingUrl: data.hospitableBookingUrl,
      amenities: data.amenities,
      imageUrl: '/placeholder.svg' // TODO: Handle uploaded photos
    };

    setProperties(prev => [...prev, newProperty]);
    
    toast({
      title: "Property Added",
      description: "Your property has been successfully added to the listings.",
    });
  };

  const editProperty = (id: string) => {
    console.log('Edit property:', id);
    // TODO: Implement edit functionality
    toast({
      title: "Edit Property",
      description: "Edit functionality coming soon...",
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
