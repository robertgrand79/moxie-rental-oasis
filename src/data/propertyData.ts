
import { PropertyData } from '@/types/propertyData';

// This file contains sample/demo property data for development purposes only.
// In production, properties should be fetched from the database via the properties table.
// New tenants start with empty properties and must add their own listings.

export const propertyData: Record<string, PropertyData> = {
  'sample-house': {
    id: 'sample-house',
    title: 'Sample Property - Demo Only',
    address: '123 Main St, Your City',
    description: 'This is a sample property for development purposes. In production, properties are loaded from your database.',
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 6,
    pricePerNight: 150,
    imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
    amenities: ['WiFi', 'Kitchen', 'Parking', 'TV', 'Washer/Dryer'],
    rating: 4.8,
    reviews: 0
  },
  'sample-studio': {
    id: 'sample-studio',
    title: 'Sample Studio - Demo Only',
    address: '456 Oak Ave, Your City',
    description: 'This is a sample studio for development purposes. In production, properties are loaded from your database.',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    pricePerNight: 100,
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
    amenities: ['WiFi', 'Kitchenette', 'TV', 'Air Conditioning'],
    rating: 4.6,
    reviews: 0
  }
};
