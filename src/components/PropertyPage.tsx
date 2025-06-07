
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Bed, Bath, Users, Star, Wifi, Car, ChefHat, Tv } from 'lucide-react';
import BackgroundWrapper from '@/components/home/BackgroundWrapper';

interface PropertyData {
  id: string;
  title: string;
  address: string;
  description: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  pricePerNight: number;
  imageUrl: string;
  amenities: string[];
  rating: number;
  reviews: number;
  hospitableBookingUrl?: string;
}

const propertyData: Record<string, PropertyData> = {
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
    reviews: 24,
    hospitableBookingUrl: 'https://booking.hospitable.com/widget/9f173de9-769e-4b7b-b861-57ccb4ab07c2/harris-st'
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
    reviews: 18,
    hospitableBookingUrl: 'https://booking.hospitable.com/widget/9f173de9-769e-4b7b-b861-57ccb4ab07c2/kincaid-st'
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
    reviews: 31,
    hospitableBookingUrl: 'https://booking.hospitable.com/widget/9f173de9-769e-4b7b-b861-57ccb4ab07c2/w-10th-house'
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
    reviews: 15,
    hospitableBookingUrl: 'https://booking.hospitable.com/widget/9f173de9-769e-4b7b-b861-57ccb4ab07c2/w-10th-studio'
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
    reviews: 27,
    hospitableBookingUrl: 'https://booking.hospitable.com/widget/9f173de9-769e-4b7b-b861-57ccb4ab07c2/woodlawn-ave'
  }
};

const getAmenityIcon = (amenity: string) => {
  switch (amenity.toLowerCase()) {
    case 'wifi':
      return <Wifi className="h-4 w-4" />;
    case 'kitchen':
    case 'kitchenette':
      return <ChefHat className="h-4 w-4" />;
    case 'parking':
      return <Car className="h-4 w-4" />;
    case 'tv':
      return <Tv className="h-4 w-4" />;
    default:
      return <Star className="h-4 w-4" />;
  }
};

const PropertyPage = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const property = propertyId ? propertyData[propertyId] : null;

  if (!property) {
    return (
      <BackgroundWrapper>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Property Not Found</h1>
            <p className="text-xl text-gray-600">The property you're looking for doesn't exist.</p>
          </div>
        </div>
      </BackgroundWrapper>
    );
  }

  return (
    <BackgroundWrapper>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          {/* Property Image */}
          <div className="aspect-video lg:aspect-[2/1] relative">
            <img 
              src={property.imageUrl} 
              alt={property.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-8 lg:p-12">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{property.title}</h1>
              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="h-5 w-5 mr-2" />
                <span className="text-lg">{property.address}</span>
              </div>
              
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="ml-1 font-semibold">{property.rating}</span>
                  <span className="ml-1 text-gray-600">({property.reviews} reviews)</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">About this property</h2>
                  <p className="text-gray-700 text-lg leading-relaxed">{property.description}</p>
                </div>

                {/* Property Details */}
                <div className="grid grid-cols-3 gap-6 mb-8">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Bed className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                    <div className="font-semibold">{property.bedrooms}</div>
                    <div className="text-sm text-gray-600">Bedrooms</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Bath className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                    <div className="font-semibold">{property.bathrooms}</div>
                    <div className="text-sm text-gray-600">Bathrooms</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <Users className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                    <div className="font-semibold">{property.maxGuests}</div>
                    <div className="text-sm text-gray-600">Guests</div>
                  </div>
                </div>

                {/* Amenities */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Amenities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {property.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        {getAmenityIcon(amenity)}
                        <span className="text-gray-700">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Booking Card */}
              <div className="lg:col-span-1">
                <Card className="sticky top-8">
                  <CardHeader>
                    <CardTitle className="text-2xl">
                      ${property.pricePerNight}
                      <span className="text-lg font-normal text-gray-600">/night</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      className="w-full mb-4 bg-gradient-to-r from-gradient-from to-gradient-accent-from hover:from-gradient-from/90 hover:to-gradient-accent-from/90"
                      onClick={() => {
                        if (property.hospitableBookingUrl) {
                          window.open(property.hospitableBookingUrl, '_blank');
                        }
                      }}
                    >
                      Book Now
                    </Button>
                    <p className="text-sm text-gray-600 text-center">
                      You won't be charged yet
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BackgroundWrapper>
  );
};

export default PropertyPage;
