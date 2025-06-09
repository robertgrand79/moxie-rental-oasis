
import React from 'react';
import { Bed, Bath, Users } from 'lucide-react';
import { Property } from '@/types/property';
import AmenityIcon from './AmenityIcon';

interface PropertyDetailsProps {
  property: Property;
}

const PropertyDetails = ({ property }: PropertyDetailsProps) => {
  // Convert amenities string to array if needed
  const amenitiesArray = React.useMemo(() => {
    if (!property.amenities) return [];
    if (Array.isArray(property.amenities)) return property.amenities;
    // If it's a string, split by common delimiters
    return property.amenities
      .split(/[,;|\n]/)
      .map(amenity => amenity.trim())
      .filter(amenity => amenity.length > 0);
  }, [property.amenities]);

  return (
    <div className="lg:col-span-2">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-4">About this property</h2>
        <p className="text-muted-foreground text-lg leading-relaxed">{property.description}</p>
      </div>

      {/* Property Details */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="text-center p-4 bg-muted/50 rounded-lg border hover:shadow-md transition-shadow duration-200">
          <Bed className="h-8 w-8 mx-auto mb-2 text-icon-purple" />
          <div className="font-semibold text-foreground">{property.bedrooms}</div>
          <div className="text-sm text-muted-foreground">Bedrooms</div>
        </div>
        <div className="text-center p-4 bg-muted/50 rounded-lg border hover:shadow-md transition-shadow duration-200">
          <Bath className="h-8 w-8 mx-auto mb-2 text-icon-blue" />
          <div className="font-semibold text-foreground">{property.bathrooms}</div>
          <div className="text-sm text-muted-foreground">Bathrooms</div>
        </div>
        <div className="text-center p-4 bg-muted/50 rounded-lg border hover:shadow-md transition-shadow duration-200">
          <Users className="h-8 w-8 mx-auto mb-2 text-icon-emerald" />
          <div className="font-semibold text-foreground">{property.max_guests}</div>
          <div className="text-sm text-muted-foreground">Guests</div>
        </div>
      </div>

      {/* Amenities */}
      {amenitiesArray.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">Amenities</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {amenitiesArray.map((amenity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg border hover:shadow-md hover:bg-muted/70 transition-all duration-200">
                <AmenityIcon amenity={amenity} />
                <span className="text-muted-foreground hover:text-foreground transition-colors duration-200">{amenity}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetails;
