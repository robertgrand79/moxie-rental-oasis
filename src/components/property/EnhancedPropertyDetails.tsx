
import React, { useState } from 'react';
import { Bed, Bath, Users, ChevronDown, ChevronUp, MapPin, Heart } from 'lucide-react';
import { Property } from '@/types/property';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AmenityIcon from './AmenityIcon';

interface EnhancedPropertyDetailsProps {
  property: Property;
}

const EnhancedPropertyDetails = ({ property }: EnhancedPropertyDetailsProps) => {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  // Convert amenities string to array if needed
  const amenitiesArray: string[] = React.useMemo(() => {
    if (!property.amenities) return [];
    if (Array.isArray(property.amenities)) return property.amenities;
    return property.amenities
      .split(/[,;|\n]/)
      .map(amenity => amenity.trim())
      .filter(amenity => amenity.length > 0);
  }, [property.amenities]);

  const AMENITIES_LIMIT = 8;
  const displayedAmenities = showAllAmenities 
    ? amenitiesArray 
    : amenitiesArray.slice(0, AMENITIES_LIMIT);
  const hasMoreAmenities = amenitiesArray.length > AMENITIES_LIMIT;

  const truncatedDescription = property.description.slice(0, 300);
  const shouldTruncate = property.description.length > 300;

  return (
    <div className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Property Overview */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">About This Property</h2>
            <div className="flex items-center justify-center mb-8">
              <MapPin className="h-5 w-5 mr-2 text-muted-foreground" />
              <span className="text-xl text-muted-foreground">{property.location}</span>
            </div>
          </div>

          {/* Property Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardContent className="p-8 text-center">
                <Bed className="h-12 w-12 mx-auto mb-4 text-icon-purple group-hover:scale-110 transition-transform duration-300" />
                <div className="text-3xl font-bold text-foreground mb-2">{property.bedrooms}</div>
                <div className="text-muted-foreground font-medium">Bedrooms</div>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardContent className="p-8 text-center">
                <Bath className="h-12 w-12 mx-auto mb-4 text-icon-blue group-hover:scale-110 transition-transform duration-300" />
                <div className="text-3xl font-bold text-foreground mb-2">{property.bathrooms}</div>
                <div className="text-muted-foreground font-medium">Bathrooms</div>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-icon-emerald group-hover:scale-110 transition-transform duration-300" />
                <div className="text-3xl font-bold text-foreground mb-2">{property.max_guests}</div>
                <div className="text-muted-foreground font-medium">Guests</div>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          <Card className="mb-16 border-0 shadow-lg">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-foreground mb-6">Description</h3>
              <div className="prose prose-lg max-w-none">
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {showFullDescription || !shouldTruncate ? property.description : truncatedDescription}
                  {!showFullDescription && shouldTruncate && '...'}
                </p>
              </div>
              
              {shouldTruncate && (
                <div className="mt-6">
                  <Button
                    variant="ghost"
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="text-primary hover:text-primary/80"
                  >
                    {showFullDescription ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-2" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-2" />
                        Read More
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Amenities */}
          {amenitiesArray.length > 0 && (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-foreground mb-8">Amenities & Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {displayedAmenities.map((amenity, index) => (
                    <div 
                      key={index} 
                      className="flex items-center space-x-3 p-4 bg-muted/50 rounded-lg border hover:shadow-md hover:bg-muted/70 transition-all duration-200 group"
                    >
                      <AmenityIcon amenity={amenity} className="group-hover:scale-110 transition-transform duration-200" />
                      <span className="text-foreground font-medium">{amenity}</span>
                    </div>
                  ))}
                </div>
                
                {hasMoreAmenities && (
                  <div className="text-center">
                    <Button
                      variant="outline"
                      onClick={() => setShowAllAmenities(!showAllAmenities)}
                      className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                    >
                      {showAllAmenities ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-2" />
                          Show Less Amenities
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-2" />
                          Show All Amenities ({amenitiesArray.length})
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedPropertyDetails;
