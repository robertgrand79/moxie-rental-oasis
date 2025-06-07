import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Property } from '@/types/property';
import { usePhotoUpload } from './usePhotoUpload';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user } = useAuth();

  const createPropertyPage = async (property: Property) => {
    if (!user) return;

    // Generate SEO-friendly slug from the address
    const slug = property.location
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();

    // Create SEO-optimized content
    const pageTitle = `${property.title} - ${property.location}`;
    const metaDescription = `Book ${property.title} in ${property.location}. ${property.bedrooms} bedrooms, ${property.bathrooms} bathrooms, sleeps ${property.maxGuests}. Starting at $${property.pricePerNight}/night.`;
    
    const pageContent = `
# ${property.title}

**Location:** ${property.location}

## Property Details
- **Bedrooms:** ${property.bedrooms}
- **Bathrooms:** ${property.bathrooms}
- **Maximum Guests:** ${property.maxGuests}
- **Price:** $${property.pricePerNight} per night

## Description
${property.description}

${property.amenities ? `## Amenities
${property.amenities}` : ''}

## Book Your Stay
Ready to experience this amazing property? Book now through our secure booking system.

[Book Now](${property.hospitableBookingUrl || '#'})

---

*Located at ${property.location}, this property offers the perfect combination of comfort and convenience for your Eugene getaway.*
    `.trim();

    try {
      const { error } = await supabase
        .from('pages')
        .insert([{
          title: pageTitle,
          slug: `property-${slug}`,
          content: pageContent,
          meta_description: metaDescription,
          is_published: true,
          created_by: user.id
        }]);

      if (error) {
        console.error('Error creating property page:', error);
        toast({
          title: "Warning",
          description: "Property added but page creation failed. You can create it manually later.",
          variant: "destructive"
        });
      } else {
        console.log('Property page created successfully');
      }
    } catch (error) {
      console.error('Error in createPropertyPage:', error);
    }
  };

  const addProperty = async (data: any) => {
    console.log('Property form submitted:', data);
    
    const propertyId = Date.now().toString();
    let images: string[] = [];
    let imageUrl = '/placeholder.svg';

    // Upload photos if any were provided
    if (data.photos && data.photos.length > 0) {
      console.log('Uploading photos for new property:', data.photos.length);
      const uploadedUrls = await uploadPhotos(data.photos, propertyId);
      if (uploadedUrls.length > 0) {
        images = uploadedUrls;
        // Use selected cover image or first image as cover
        const coverIndex = data.selectedCoverIndex ?? 0;
        imageUrl = uploadedUrls[coverIndex] || uploadedUrls[0];
        console.log('Using image as cover:', imageUrl);
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
      imageUrl,
      images
    };

    setProperties(prev => [...prev, newProperty]);
    
    // Create corresponding page for SEO
    await createPropertyPage(newProperty);
    
    toast({
      title: "Property Added",
      description: "Your property and its dedicated page have been successfully created.",
    });
  };

  const editProperty = async (id: string, data: any) => {
    console.log('Edit property:', id, data);
    
    let newImages: string[] = [];
    let imageUrl: string | undefined;

    // Get existing property to preserve current images
    const existingProperty = properties.find(p => p.id === id);
    const currentImages = existingProperty?.images || [];

    // Upload new photos if any were provided
    if (data.photos && data.photos.length > 0) {
      console.log('Uploading new photos for existing property:', data.photos.length);
      const uploadedUrls = await uploadPhotos(data.photos, id);
      if (uploadedUrls.length > 0) {
        newImages = [...currentImages, ...uploadedUrls];
        console.log('Combined images:', newImages);
      }
    } else {
      newImages = currentImages;
    }

    // Set cover image based on selection
    if (newImages.length > 0) {
      const coverIndex = data.selectedCoverIndex ?? 0;
      imageUrl = newImages[coverIndex] || newImages[0];
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
            images: newImages,
            // Only update imageUrl if we have images
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
