
import { PropertyData } from '@/types/propertyData';

export const propertyData: Record<string, PropertyData> = {
  'harris-st': {
    id: 'harris-st',
    title: 'Charming Eugene Home on Harris Street',
    address: '2920 Harris St. Eugene OR 97405',
    description: 'Beautiful home in a quiet neighborhood, perfect for families or groups visiting Eugene. Close to the University of Oregon and downtown attractions.',
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 6,
    pricePerNight: 180,
    imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
    amenities: ['WiFi', 'Kitchen', 'Parking', 'TV', 'Washer/Dryer'],
    rating: 4.8,
    reviews: 24
  },
  'kincaid-st': {
    id: 'kincaid-st',
    title: 'Modern Kincaid Street Retreat',
    address: '2614 Kincaid St. Eugene OR 97405',
    description: 'Contemporary home with modern amenities in a desirable Eugene location. Perfect for business travelers and vacation guests alike.',
    bedrooms: 2,
    bathrooms: 2,
    maxGuests: 4,
    pricePerNight: 160,
    imageUrl: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80',
    amenities: ['WiFi', 'Kitchen', 'Parking', 'TV', 'Air Conditioning'],
    rating: 4.9,
    reviews: 18
  },
  'w-10th-house': {
    id: 'w-10th-house',
    title: 'Downtown Eugene House on 10th Street',
    address: '358 W 10th St. Eugene OR 97401',
    description: 'Spacious downtown Eugene home within walking distance of restaurants, shops, and entertainment. Ideal for exploring the city.',
    bedrooms: 4,
    bathrooms: 3,
    maxGuests: 8,
    pricePerNight: 220,
    imageUrl: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=80',
    amenities: ['WiFi', 'Kitchen', 'Parking', 'TV', 'Patio'],
    rating: 4.7,
    reviews: 31
  },
  'w-10th-studio': {
    id: 'w-10th-studio',
    title: 'Cozy Downtown Studio on 10th Street',
    address: '358 W 10th Studio Eugene OR 97401',
    description: 'Modern studio apartment in the heart of downtown Eugene. Perfect for solo travelers or couples looking for a convenient city stay.',
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    pricePerNight: 120,
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
    amenities: ['WiFi', 'Kitchenette', 'TV', 'Air Conditioning'],
    rating: 4.6,
    reviews: 15
  },
  'woodlawn-ave': {
    id: 'woodlawn-ave',
    title: 'Elegant Woodlawn Avenue Home',
    address: '1885 Woodlawn Ave Eugene OR 97403',
    description: 'Beautiful home in a tree-lined neighborhood offering comfort and tranquility. Great for families and extended stays in Eugene.',
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 6,
    pricePerNight: 190,
    imageUrl: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=800&q=80',
    amenities: ['WiFi', 'Kitchen', 'Parking', 'TV', 'Garden', 'Fireplace'],
    rating: 4.8,
    reviews: 27
  }
};
