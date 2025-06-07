
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Bed, Bath, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Property {
  id: string;
  title: string;
  description: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  pricePerNight: number;
  imageUrl: string;
  propertyPageUrl: string;
}

const featuredProperties: Property[] = [
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
    propertyPageUrl: '/property/harris-st'
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
    propertyPageUrl: '/property/kincaid-st'
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
    propertyPageUrl: '/property/w-10th-house'
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
    propertyPageUrl: '/property/w-10th-studio'
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
    propertyPageUrl: '/property/woodlawn-ave'
  }
];

const PropertyShowcase = () => {
  return (
    <section className="py-12 sm:py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Our Eugene Properties
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover our handpicked collection of vacation rentals in Eugene, Oregon.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {featuredProperties.map((property) => (
            <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video relative">
                <img 
                  src={property.imageUrl} 
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">{property.title}</CardTitle>
                <CardDescription className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-1" />
                  {property.location}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {property.description}
                </p>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center">
                    <Bed className="h-4 w-4 mr-1" />
                    {property.bedrooms}
                  </div>
                  <div className="flex items-center">
                    <Bath className="h-4 w-4 mr-1" />
                    {property.bathrooms}
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {property.maxGuests}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="font-semibold text-lg">
                    ${property.pricePerNight}
                    <span className="text-sm font-normal text-muted-foreground">/night</span>
                  </div>
                  <Link to={property.propertyPageUrl}>
                    <Button size="sm" className="w-full sm:w-auto">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PropertyShowcase;
