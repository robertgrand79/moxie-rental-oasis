
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Bed, Bath, Users } from 'lucide-react';

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
  hospitableBookingUrl?: string;
}

const mockProperties: Property[] = [
  {
    id: '1',
    title: 'Oceanfront Villa Paradise',
    description: 'Stunning beachfront property with panoramic ocean views and private beach access.',
    location: 'Malibu, CA',
    bedrooms: 4,
    bathrooms: 3,
    maxGuests: 8,
    pricePerNight: 450,
    imageUrl: 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?auto=format&fit=crop&w=800&q=80',
    hospitableBookingUrl: '#'
  },
  {
    id: '2',
    title: 'Mountain Retreat Cabin',
    description: 'Cozy cabin nestled in the mountains with breathtaking valley views.',
    location: 'Aspen, CO',
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 6,
    pricePerNight: 320,
    imageUrl: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=800&q=80',
    hospitableBookingUrl: '#'
  },
  {
    id: '3',
    title: 'Downtown Luxury Loft',
    description: 'Modern loft in the heart of the city with premium amenities.',
    location: 'New York, NY',
    bedrooms: 2,
    bathrooms: 2,
    maxGuests: 4,
    pricePerNight: 280,
    imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
    hospitableBookingUrl: '#'
  },
  {
    id: '4',
    title: 'Tropical Beach House',
    description: 'Private beach house with infinity pool and tropical gardens.',
    location: 'Maui, HI',
    bedrooms: 5,
    bathrooms: 4,
    maxGuests: 10,
    pricePerNight: 550,
    imageUrl: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=800&q=80',
    hospitableBookingUrl: '#'
  },
  {
    id: '5',
    title: 'Wine Country Estate',
    description: 'Elegant estate surrounded by vineyards with wine tasting experiences.',
    location: 'Napa Valley, CA',
    bedrooms: 6,
    bathrooms: 5,
    maxGuests: 12,
    pricePerNight: 680,
    imageUrl: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=800&q=80',
    hospitableBookingUrl: '#'
  }
];

const PropertyShowcase = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Featured Properties
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover our handpicked collection of premium vacation rentals in the most desirable destinations.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockProperties.map((property) => (
            <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video relative">
                <img 
                  src={property.imageUrl} 
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-xl">{property.title}</CardTitle>
                <CardDescription className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-1" />
                  {property.location}
                </CardDescription>
              </CardHeader>
              <CardContent>
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

                <div className="flex items-center justify-between">
                  <div className="font-semibold text-lg">
                    ${property.pricePerNight}
                    <span className="text-sm font-normal text-muted-foreground">/night</span>
                  </div>
                  <Button size="sm">
                    Book Now
                  </Button>
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
