import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Bed, Bath, Users, Loader2, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProperties } from '@/hooks/useProperties';
import { usePropertiesAvailability } from '@/hooks/useAvailabilitySearch';
import { generateAddressSlug } from '@/utils/addressSlug';
import PropertyPriceDisplay from '@/components/search/PropertyPriceDisplay';

interface SearchPropertyResultsProps {
  checkin: string;
  checkout: string;
  guests: string;
}

const SearchPropertyResults = ({ checkin, checkout, guests }: SearchPropertyResultsProps) => {
  const { properties, loading: propertiesLoading } = useProperties();
  const { data: availability, isLoading: availabilityLoading } = usePropertiesAvailability(
    checkin,
    checkout,
    !!checkin && !!checkout
  );
  const [showUnavailable, setShowUnavailable] = useState(false);

  const isLoading = propertiesLoading || availabilityLoading;
  const guestCount = parseInt(guests) || 0;

  // Filter properties by availability and guest capacity
  const availablePropertyIds = new Set(availability?.availableProperties?.map(p => p.id) || []);
  const unavailablePropertyIds = new Set(availability?.unavailablePropertyIds || []);

  const availableProperties = properties.filter(property => {
    const isAvailable = availablePropertyIds.has(property.id);
    const hasCapacity = guestCount === 0 || (property.max_guests || 0) >= guestCount;
    return isAvailable && hasCapacity;
  });

  const unavailableProperties = properties.filter(property => {
    const isUnavailable = unavailablePropertyIds.has(property.id);
    const lacksCapacity = guestCount > 0 && (property.max_guests || 0) < guestCount;
    return isUnavailable || lacksCapacity;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Checking availability...</span>
      </div>
    );
  }

  // If no dates selected, show all properties
  if (!checkin || !checkout) {
    return (
      <div>
        <p className="text-muted-foreground mb-6">Select dates to see availability</p>
        <PropertyGrid properties={properties} checkin={checkin} checkout={checkout} />
      </div>
    );
  }

  return (
    <div>
      {/* Available Properties Count */}
      <div className="flex items-center gap-2 mb-6">
        <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white px-3 py-1">
          <CheckCircle className="h-4 w-4 mr-1" />
          {availableProperties.length} {availableProperties.length === 1 ? 'property' : 'properties'} available
        </Badge>
      </div>

      {/* Available Properties */}
      {availableProperties.length > 0 ? (
        <PropertyGrid 
          properties={availableProperties} 
          checkin={checkin} 
          checkout={checkout}
          showAvailabilityBadge 
        />
      ) : (
        <div className="text-center py-8 bg-muted/50 rounded-lg">
          <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-lg text-muted-foreground">No properties available for these dates</p>
          <p className="text-sm text-muted-foreground mt-1">Try adjusting your dates or guest count</p>
        </div>
      )}

      {/* Unavailable Properties Section */}
      {unavailableProperties.length > 0 && (
        <div className="mt-8 pt-6 border-t border-border">
          <button
            onClick={() => setShowUnavailable(!showUnavailable)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            {showUnavailable ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            <span>Not available for these dates ({unavailableProperties.length})</span>
          </button>

          {showUnavailable && (
            <div className="opacity-60">
              <PropertyGrid 
                properties={unavailableProperties} 
                checkin={checkin} 
                checkout={checkout}
                isUnavailable 
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface PropertyGridProps {
  properties: any[];
  checkin: string;
  checkout: string;
  showAvailabilityBadge?: boolean;
  isUnavailable?: boolean;
}

const PropertyGrid = ({ properties, checkin, checkout, showAvailabilityBadge, isUnavailable }: PropertyGridProps) => {
  if (properties.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => {
        const addressSlug = generateAddressSlug(property.location);
        const bookingUrl = checkin && checkout 
          ? `/property/${addressSlug}?tab=booking&checkin=${checkin}&checkout=${checkout}`
          : `/property/${addressSlug}?tab=booking`;

        return (
          <Card 
            key={property.id} 
            className={`overflow-hidden transition-shadow ${isUnavailable ? 'grayscale' : 'hover:shadow-lg'}`}
          >
            <div className="aspect-video relative">
              <img 
                src={property.image_url} 
                alt={property.title}
                className="w-full h-full object-cover"
              />
              {showAvailabilityBadge && (
                <Badge className="absolute top-2 right-2 bg-green-600 text-white">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Available
                </Badge>
              )}
              {isUnavailable && (
                <Badge variant="destructive" className="absolute top-2 right-2">
                  <XCircle className="h-3 w-3 mr-1" />
                  Not Available
                </Badge>
              )}
            </div>
            <CardHeader className="p-4">
              <CardTitle className="text-lg">{property.title}</CardTitle>
              <CardDescription className="flex items-center text-sm">
                <MapPin className="h-4 w-4 mr-1" />
                {property.location}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {property.description}
              </p>
              
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                <div className="flex items-center">
                  <Bed className="h-4 w-4 mr-1" />
                  {property.bedrooms}
                </div>
                <div className="flex items-center">
                  <Bath className="h-4 w-4 mr-1" />
                  {property.bathrooms}
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {property.max_guests}
                </div>
              </div>

              {/* Pricing Display - only show for available properties with dates */}
              {checkin && checkout && !isUnavailable && (
                <PropertyPriceDisplay
                  propertyId={property.id}
                  checkin={checkin}
                  checkout={checkout}
                  basePricePerNight={property.price_per_night}
                />
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                <Link to={`/property/${addressSlug}`} className="flex-1">
                  <Button size="sm" variant="outline" className="w-full">
                    View Details
                  </Button>
                </Link>
                {!isUnavailable && (
                  <Link to={bookingUrl} className="flex-1">
                    <Button size="sm" className="w-full">
                      Book Now
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default SearchPropertyResults;
