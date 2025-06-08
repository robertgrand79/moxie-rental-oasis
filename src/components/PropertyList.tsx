
import React from 'react';
import { Trash2, Edit3, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Property } from '@/types/property';

interface PropertyListProps {
  properties: Property[];
  onEdit?: (property: Property) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
}

const PropertyList = ({ properties, onEdit, onDelete, showActions = true }: PropertyListProps) => {
  const handleDeleteClick = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      onDelete?.(id);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          {property.image_url && (
            <div className="aspect-video overflow-hidden">
              <img
                src={property.image_url}
                alt={property.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
          
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold line-clamp-2">
                  {property.title}
                </CardTitle>
                <CardDescription className="text-sm text-gray-600 mt-1">
                  {property.location}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="ml-2">
                ${property.price_per_night}/night
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            <p className="text-gray-700 text-sm line-clamp-3 mb-4">
              {property.description}
            </p>
            
            <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
              <span>{property.bedrooms} bed • {property.bathrooms} bath</span>
              <span>Up to {property.max_guests} guests</span>
            </div>
            
            {property.amenities && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 font-medium mb-2">Amenities:</p>
                <p className="text-sm text-gray-700 line-clamp-2">{property.amenities}</p>
              </div>
            )}
            
            <div className="flex gap-2">
              {property.hospitable_booking_url && (
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => window.open(property.hospitable_booking_url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Book Now
                </Button>
              )}
              
              {showActions && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit?.(property)}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteClick(property.id, property.title)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PropertyList;
