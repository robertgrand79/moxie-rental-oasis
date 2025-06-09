
import React from 'react';
import { Property } from '@/types/property';
import { Bed, Bath, Users, Star, Wifi, Car, ChefHat } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import AmenityIcon from './AmenityIcon';

interface PropertyInfoSectionProps {
  property: Property;
}

const PropertyInfoSection = ({ property }: PropertyInfoSectionProps) => {
  // Parse amenities for quick preview
  const amenitiesList = property.amenities 
    ? property.amenities.split(',').map(a => a.trim()).filter(a => a.length > 0)
    : [];
  
  const quickAmenities = amenitiesList.slice(0, 6); // Show first 6 amenities

  return (
    <div className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Property Specifications */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardContent className="pt-8 pb-6">
                <div className="flex justify-center mb-4">
                  <div className="bg-primary/10 rounded-full p-4">
                    <Bed className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">{property.bedrooms}</h3>
                <p className="text-muted-foreground">Bedroom{property.bedrooms !== 1 ? 's' : ''}</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardContent className="pt-8 pb-6">
                <div className="flex justify-center mb-4">
                  <div className="bg-primary/10 rounded-full p-4">
                    <Bath className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">{property.bathrooms}</h3>
                <p className="text-muted-foreground">Bathroom{property.bathrooms !== 1 ? 's' : ''}</p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardContent className="pt-8 pb-6">
                <div className="flex justify-center mb-4">
                  <div className="bg-primary/10 rounded-full p-4">
                    <Users className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">{property.max_guests}</h3>
                <p className="text-muted-foreground">Guest{property.max_guests !== 1 ? 's' : ''}</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Amenities Preview */}
          {quickAmenities.length > 0 && (
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-foreground mb-6 text-center">Popular Amenities</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {quickAmenities.map((amenity, index) => (
                  <div key={index} className="flex flex-col items-center p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors duration-200">
                    <AmenityIcon amenity={amenity} className="mb-2" />
                    <span className="text-sm text-center text-muted-foreground capitalize">{amenity}</span>
                  </div>
                ))}
              </div>
              {amenitiesList.length > 6 && (
                <p className="text-center text-sm text-muted-foreground mt-4">
                  And {amenitiesList.length - 6} more amenities...
                </p>
              )}
            </div>
          )}

          {/* Property Description */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground mb-6">About This Property</h2>
            <div className="prose prose-lg mx-auto text-muted-foreground">
              <p className="text-lg leading-relaxed">{property.description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyInfoSection;
