
import React from 'react';
import { MapPin, Star, Calendar } from 'lucide-react';
import { Property } from '@/types/property';

interface PropertyLocationInfoProps {
  property: Property;
  isMobile: boolean;
}

const PropertyLocationInfo = ({ property, isMobile }: PropertyLocationInfoProps) => {
  if (isMobile) {
    return (
      <div className="flex items-center text-muted-foreground mb-4">
        <MapPin className="h-4 w-4 mr-2 text-primary" />
        <span className="text-sm font-medium">{property.location}</span>
      </div>
    );
  }

  return (
    <div className="bg-muted p-6 border-b border-border">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center text-foreground">
          <MapPin className="h-5 w-5 mr-2 text-primary" />
          <span className="font-medium">{property.location}</span>
        </div>
        <div className="flex items-center space-x-6 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Star className="h-4 w-4 mr-1 text-icon-amber fill-current" />
            <span>Premium Property</span>
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1 text-primary" />
            <span>Available Year-Round</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyLocationInfo;
