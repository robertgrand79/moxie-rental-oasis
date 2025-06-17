
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
      <div className="flex items-center text-gray-600 mb-4">
        <MapPin className="h-4 w-4 mr-2 text-primary" />
        <span className="text-sm font-medium">{property.location}</span>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-6 border-b border-gray-200">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center text-gray-700">
          <MapPin className="h-5 w-5 mr-2 text-primary" />
          <span className="font-medium">{property.location}</span>
        </div>
        <div className="flex items-center space-x-6 text-sm text-gray-600">
          <div className="flex items-center">
            <Star className="h-4 w-4 mr-1 text-amber-500 fill-current" />
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
