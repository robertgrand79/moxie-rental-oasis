
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Bed, Bath, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTenantProperties } from '@/hooks/useTenantProperties';
import { generateAddressSlug } from '@/utils/addressSlug';
import OptimizedImage from '@/components/ui/optimized-image';
import PropertyCardSkeleton from '@/components/ui/property-card-skeleton';
import { useTenantSettings } from '@/hooks/useTenantSettings';
import { Images } from 'lucide-react';
import { Property } from '@/types/property';

// Get the best available image URL for a property
const getBestImageUrl = (property: Property): string | null => {
  if (property.cover_image_url) return property.cover_image_url;
  if (property.image_url) return property.image_url;
  if (property.images && Array.isArray(property.images) && property.images.length > 0) return property.images[0];
  if (property.featured_photos && Array.isArray(property.featured_photos) && property.featured_photos.length > 0) return property.featured_photos[0];
  return null;
};

const CompactPropertyShowcase = () => {
  const { properties, loading } = useTenantProperties();
  const { settings } = useTenantSettings();

  const sectionTitle = settings.propertiesSectionTitle || 'Our Properties';
  const sectionDescription = settings.propertiesSectionDescription || 
    'Discover our handpicked collection of vacation rentals';

  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-12 mx-auto border border-white/30">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              {sectionTitle}
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-gradient-from to-gradient-accent-from mx-auto mb-8 rounded-full"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {sectionDescription}
            </p>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {Array.from({ length: 5 }).map((_, index) => (
                <PropertyCardSkeleton key={index} />
              ))}
            </div>
          ) : properties.length > 0 ? (
            <>
              {/* Properties Grid - Show 5 properties for optimal display */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-12">
                {properties.slice(0, 5).map((property) => {
                  // Generate clean address slug without property ID
                  const addressSlug = generateAddressSlug(property.location);
                  
                  return (
                    <Card key={property.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white border-0 shadow-md">
                      <div className="aspect-[4/3] relative overflow-hidden">
                        {(() => {
                          const imageUrl = getBestImageUrl(property);
                          return imageUrl ? (
                            <OptimizedImage
                              src={imageUrl}
                              alt={property.title}
                              width={300}
                              height={225}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                              <Images className="h-8 w-8 text-gray-400" />
                            </div>
                          );
                        })()}
                      </div>
                      <CardContent className="p-6">
                        <h3 className="font-bold text-lg mb-2 line-clamp-2 text-gray-900 min-h-[3.5rem]">
                          {property.title}
                        </h3>
                        
                        <div className="flex items-center text-sm text-gray-500 mb-4">
                          <MapPin className="h-4 w-4 mr-1 flex-shrink-0 text-icon-blue" />
                          <span className="line-clamp-1">{property.location}</span>
                        </div>
                        
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

                        <div className="flex justify-center">
                          <Link to={`/property/${addressSlug}`}>
                            <Button size="sm" className="min-h-[40px] w-full">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
              {/* View All Properties Button - Fixed to link to /properties */}
              <div className="text-center">
                <Link to="/properties">
                  <Button variant="outline" size="lg" className="px-8 min-h-[48px] border-2">
                    View All Properties
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-xl text-gray-600 mb-4">No properties available at the moment.</p>
              <p className="text-gray-500">Check back soon for new listings!</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CompactPropertyShowcase;
