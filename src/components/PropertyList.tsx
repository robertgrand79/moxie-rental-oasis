
import React from 'react';
import { Trash2, Edit3, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Bed, Bath, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Property } from '@/types/property';
import { generateAddressSlug } from '@/utils/addressSlug';
import OptimizedImage from '@/components/ui/optimized-image';
import ImagePreloader from '@/components/ui/image-preloader';

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
  // Defensive programming: handle undefined or null properties
  const safeProperties = properties || [];
  
  // Early return for empty properties
  if (!Array.isArray(safeProperties) || safeProperties.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No properties found.</p>
      </div>
    );
  }

  // Helper function to get the best image URL for thumbnail display
  const getBestImageUrl = (property: Property): string | null => {
    // Priority: cover_image_url > image_url > images[0]
    if (property.cover_image_url) {
      console.log('🖼️ Using cover_image_url:', property.cover_image_url);
      return property.cover_image_url;
    }
    
    if (property.image_url) {
      console.log('🖼️ Using image_url:', property.image_url);
      return property.image_url;
    }
    
    if (property.images && Array.isArray(property.images) && property.images.length > 0) {
      console.log('🖼️ Using first image from array:', property.images[0]);
      return property.images[0];
    }
    
    console.log('🖼️ No image found for property:', property.title);
    return null;
  };

  const handleDeleteClick = (id: string, title: string) => {
    if (deletingProperties.has(id)) {
      return; // Prevent multiple deletion attempts
    }
    
    if (window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      onDelete?.(id);
    }
  };

  // Collect first 6 property images for preloading
  const priorityImages = safeProperties
    .slice(0, 6)
    .map(getBestImageUrl)
    .filter((url): url is string => Boolean(url));

  return (
    <>
      <ImagePreloader images={priorityImages} priority={true} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {safeProperties.map((property) => {
        // Additional safety check for individual property
        if (!property || !property.id) {
          console.warn('PropertyList: Skipping invalid property', property);
          return null;
        }

        const isDeleting = deletingProperties.has(property.id);
        const addressSlug = generateAddressSlug(property.location || '');
        const imageUrl = getBestImageUrl(property);
        
        return (
          <Card 
            key={property.id} 
            className={`group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white border-0 shadow-md ${
              isDeleting ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            <div className="aspect-[4/3] relative overflow-hidden">
              {imageUrl ? (
                <OptimizedImage
                  src={imageUrl}
                  alt={property.title || 'Property image'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  fallbackIcon={true}
                  width={400}
                  height={300}
                  priority={safeProperties.indexOf(property) < 6} // Prioritize first 6 images
                  quality={85}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <div className="text-2xl mb-2">🏠</div>
                    <div className="text-sm">No image available</div>
                  </div>
                </div>
              )}
            </div>
            
            <CardHeader className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="font-bold text-lg mb-2 line-clamp-2 text-gray-900 min-h-[3.5rem]">
                    {property.title || 'Untitled Property'}
                  </CardTitle>
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0 text-icon-blue" />
                    <span className="line-clamp-1">{property.location || 'Location not specified'}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-6 pt-0">
              <p className="text-gray-700 text-sm line-clamp-3 mb-4">
                {property.description || 'No description available'}
              </p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                <div className="flex items-center">
                  <Bed className="h-4 w-4 mr-1 text-icon-purple" />
                  <span>{property.bedrooms || 0}</span>
                </div>
                <div className="flex items-center">
                  <Bath className="h-4 w-4 mr-1 text-icon-teal" />
                  <span>{property.bathrooms || 0}</span>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1 text-icon-emerald" />
                  <span>{property.max_guests || 0}</span>
                </div>
              </div>

              {property.amenities && (
                <div className="mb-6">
                  <p className="text-xs text-gray-500 font-medium mb-2">Amenities:</p>
                  <p className="text-sm text-gray-700 line-clamp-2">{property.amenities}</p>
                </div>
              )}

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
                      onClick={() => handleDeleteClick(property.id, property.title || 'Property')}
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
      }).filter(Boolean)}
      </div>
    </>
  );
};

export default PropertyList;
