
import React from 'react';
import { MapPin, Star } from 'lucide-react';
import { PropertyData } from '@/types/propertyData';

interface PropertyHeaderProps {
  property: PropertyData;
}

const PropertyHeader = ({ property }: PropertyHeaderProps) => {
  return (
    <div className="mb-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">{property.title}</h1>
      <div className="flex items-center text-gray-600 mb-4">
        <MapPin className="h-5 w-5 mr-2 text-icon-gray" />
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
  );
};

export default PropertyHeader;
