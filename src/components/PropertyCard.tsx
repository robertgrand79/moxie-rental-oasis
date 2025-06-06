
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash2, MapPin, Bed, Bath, Users } from 'lucide-react';
import { Property } from '@/types/property';

interface PropertyCardProps {
  property: Property;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const PropertyCard = ({ property, onEdit, onDelete }: PropertyCardProps) => {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video bg-gray-200 relative">
        <img 
          src={property.imageUrl} 
          alt={property.title}
          className="w-full h-full object-cover"
        />
      </div>
      <CardHeader>
        <CardTitle className="text-lg">{property.title}</CardTitle>
        <CardDescription className="flex items-center text-sm">
          <MapPin className="h-3 w-3 mr-1" />
          {property.location}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">{property.description}</p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center">
            <Bed className="h-4 w-4 mr-1" />
            {property.bedrooms} bed
          </div>
          <div className="flex items-center">
            <Bath className="h-4 w-4 mr-1" />
            {property.bathrooms} bath
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            {property.maxGuests} guests
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="font-semibold text-lg">
            ${property.pricePerNight}<span className="text-sm font-normal text-gray-500">/night</span>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onEdit(property.id)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onDelete(property.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCard;
