
import React from 'react';
import { Trash2, Edit3, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Bed, Bath, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Property } from '@/types/property';
import { generateAddressSlug } from '@/utils/addressSlug';

interface PropertyListProps {
  properties: Property[];
  onEdit?: (property: Property) => void;
  onDelete?: (id: string) => void;
  showActions?: boolean;
  deletingProperties?: Set<string>;
}

const PropertyList = ({ 
  properties, 
  onEdit, 
  onDelete, 
  showActions = true,
  deletingProperties = new Set()
}: PropertyListProps) => {
  const handleDeleteClick = (id: string, title: string) => {
    if (deletingProperties.has(id)) {
      return; // Prevent multiple deletion attempts
    }
    
    if (window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      onDelete?.(id);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {properties.map((property) => {
        const isDeleting = deletingProperties.has(property.id);
        const addressSlug = generateAddressSlug(property.location);
        
        return (
          <Card 
            key={property.id} 
            className={`group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white border-0 shadow-md ${
              isDeleting ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            {property.image_url && (
              <div className="aspect-[4/3] relative overflow-hidden">
                <img
                  src={property.image_url}
                  alt={property.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            
            <CardHeader className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="font-bold text-lg mb-2 line-clamp-2 text-gray-900 min-h-[3.5rem]">
                    {property.title}
                  </CardTitle>
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0 text-icon-blue" />
                    <span className="line-clamp-1">{property.location}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-6 pt-0">
              <p className="text-gray-700 text-sm line-clamp-3 mb-4">
                {property.description}
              </p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                <div className="flex items-center">
                  <Bed className="h-4 w-4 mr-1 text-icon-purple" />
                  <span>{property.bedrooms}</span>
                </div>
                <div className="flex items-center">
                  <Bath className="h-4 w-4 mr-1 text-icon-teal" />
                  <span>{property.bathrooms}</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1 text-icon-emerald" />
                  <span>{property.max_guests}</span>
                </div>
              </div>

              {property.amenities && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 font-medium mb-2">Amenities:</p>
                  <p className="text-sm text-gray-700 line-clamp-2">{property.amenities}</p>
                </div>
              )}
              
              <div className="flex items-center justify-between mb-4">
                <div className="font-bold text-lg text-gray-900">
                  ${property.price_per_night}
                  <span className="text-sm font-normal text-gray-500">/night</span>
                </div>
              </div>

              <div className="flex gap-2">
                {!showActions && (
                  <Link to={`/property/${addressSlug}`} className="flex-1">
                    <Button size="sm" className="w-full min-h-[40px]">
                      View Details
                    </Button>
                  </Link>
                )}
                
                {property.hospitable_booking_url && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    className={!showActions ? "flex-1" : "flex-1"}
                    onClick={() => window.open(property.hospitable_booking_url, '_blank')}
                    disabled={isDeleting}
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
                      disabled={isDeleting}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClick(property.id, property.title)}
                      disabled={isDeleting}
                      className={isDeleting ? 'opacity-50' : ''}
                    >
                      {isDeleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default PropertyList;
