
import React from 'react';
import { Bed, Bath, Users } from 'lucide-react';
import { PropertyData } from '@/types/propertyData';
import AmenityIcon from './AmenityIcon';

interface PropertyDetailsProps {
  property: PropertyData;
}

const PropertyDetails = ({ property }: PropertyDetailsProps) => {
  return (
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
              <AmenityIcon amenity={amenity} />
              <span className="text-gray-700">{amenity}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
