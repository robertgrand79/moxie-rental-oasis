
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Property } from '@/types/property';
import { Bed, Bath, Users, MapPin, Calendar, Star, Wifi, Car, ChefHat } from 'lucide-react';

interface QuickInfoSectionProps {
  property: Property;
}

const QuickInfoSection = ({ property }: QuickInfoSectionProps) => {
  const quickAmenities = property.amenities 
    ? property.amenities.split(',').slice(0, 3).map(a => a.trim())
    : [];

  return (
    <div className="bg-background py-6 border-b border-border">
      <div className="container mx-auto px-4">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Bed className="h-6 w-6 text-primary" />
            </div>
            <div className="text-lg font-bold text-foreground">{property.bedrooms}</div>
            <div className="text-sm text-muted-foreground">Bedroom{property.bedrooms !== 1 ? 's' : ''}</div>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Bath className="h-6 w-6 text-primary" />
            </div>
            <div className="text-lg font-bold text-foreground">{property.bathrooms}</div>
            <div className="text-sm text-muted-foreground">Bathroom{property.bathrooms !== 1 ? 's' : ''}</div>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div className="text-lg font-bold text-foreground">{property.max_guests}</div>
            <div className="text-sm text-muted-foreground">Guest{property.max_guests !== 1 ? 's' : ''}</div>
          </div>
        </div>

        {/* Quick Amenities - Mobile Only */}
        {quickAmenities.length > 0 && (
          <div className="lg:hidden">
            <h3 className="text-sm font-semibold text-foreground mb-3">Popular Amenities</h3>
            <div className="flex space-x-4">
              {quickAmenities.map((amenity, index) => (
                <div key={index} className="flex items-center space-x-2 bg-muted rounded-full px-3 py-2">
                  <Wifi className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-foreground capitalize">{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Location & Rating */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
          <div className="flex items-center text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2" />
            <span className="text-sm">{property.location}</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-icon-amber fill-current mr-1" />
              <span className="text-sm font-semibold">4.8</span>
              <span className="text-sm text-muted-foreground ml-1">(24 reviews)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickInfoSection;
