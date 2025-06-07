
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Bed, Bath, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProperties } from '@/hooks/useProperties';

const CompactPropertyShowcase = () => {
  const { properties } = useProperties();

  return (
    <div className="py-16 relative">
      <div className="container mx-auto px-4">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-12 mx-auto border border-white/20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Eugene Properties
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-gradient-from to-gradient-accent-from mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Discover our handpicked collection of vacation rentals in Eugene's most desirable neighborhoods.
            </p>
          </div>
          
          {properties.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {properties.map((property) => (
                  <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group flex flex-col">
                    <div className="aspect-[4/3] relative">
                      <img 
                        src={property.imageUrl} 
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-4 flex flex-col flex-1">
                      <h3 className="font-semibold text-sm mb-2 line-clamp-2 text-gray-900 min-h-[2.5rem]">
                        {property.title}
                      </h3>
                      <div className="flex items-center text-xs text-gray-500 mb-3">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span className="line-clamp-1">{property.location}</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                        <div className="flex items-center">
                          <Bed className="h-3 w-3 mr-1" />
                          {property.bedrooms}
                        </div>
                        <div className="flex items-center">
                          <Bath className="h-3 w-3 mr-1" />
                          {property.bathrooms}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {property.maxGuests}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 mt-auto">
                        <div className="font-semibold text-sm">
                          ${property.pricePerNight}
                          <span className="text-xs font-normal text-gray-500">/night</span>
                        </div>
                        <Link to={`/property/${property.id}`} className="w-full">
                          <Button size="sm" className="w-full text-xs h-8">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="text-center mt-8">
                <Link to="/listings">
                  <Button variant="outline" size="lg" className="px-8">
                    View All Properties
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-gray-600 mb-4">No properties available at the moment.</p>
              <p className="text-sm text-gray-500">Check back soon for new listings!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompactPropertyShowcase;
