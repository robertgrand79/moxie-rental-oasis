
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Bed, Bath, Users, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTenantProperties } from '@/hooks/useTenantProperties';
import { generateAddressSlug } from '@/utils/addressSlug';
import { useTenantSettings } from '@/hooks/useTenantSettings';
import ThumbnailImage from '@/components/ui/thumbnail-image';

const PropertyShowcase = () => {
  const { properties, loading } = useTenantProperties();
  const { settings } = useTenantSettings();

  // Dynamic location text from tenant settings
  const locationText = settings.heroLocationText || settings.location || 'our area';

  if (loading) {
    return (
      <section className="py-12 sm:py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Our Properties
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover our handpicked collection of vacation rentals in {locationText}.
            </p>
          </div>
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2 text-muted-foreground">Loading properties...</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 sm:py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Our Properties
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover our handpicked collection of vacation rentals in {locationText}.
          </p>
        </div>
        
        {properties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {properties.map((property) => {
              // Generate clean address slug without property ID
              const addressSlug = generateAddressSlug(property.location);
              
              return (
                <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video relative">
                    <ThumbnailImage
                      src={property.image_url || ''}
                      alt={property.title}
                      className="w-full h-full"
                    />
                  </div>
                  <CardHeader className="p-4 sm:p-6">
                    <CardTitle className="text-lg sm:text-xl">{property.title}</CardTitle>
                    <CardDescription className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-1" />
                      {property.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0">
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {property.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-6">
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

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link to={`/property/${addressSlug}`} className="flex-1">
                        <Button size="sm" variant="outline" className="w-full">
                          View Details
                        </Button>
                      </Link>
                      <Link to={`/property/${addressSlug}?tab=booking`} className="flex-1">
                        <Button size="sm" className="w-full">
                          Book Now
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-4">No properties available at the moment.</p>
            <p className="text-sm text-muted-foreground">Check back soon for new listings!</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default PropertyShowcase;
