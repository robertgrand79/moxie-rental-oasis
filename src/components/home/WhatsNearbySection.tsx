import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Car, Phone, Globe, Star } from 'lucide-react';
import OptimizedImage from '@/components/ui/optimized-image';
import { useTenantPointsOfInterest } from '@/hooks/useTenantPointsOfInterest';

const categoryLabels: Record<string, string> = {
  dining: 'Dining',
  outdoor: 'Outdoor',
  entertainment: 'Entertainment',
  shopping: 'Shopping',
  accommodation: 'Accommodation',
  lifestyle: 'Lifestyle',
  restaurant: 'Restaurants',
  attraction: 'Attractions',
  culture: 'Culture',
};

const WhatsNearbySection = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { pointsOfInterest, isLoading } = useTenantPointsOfInterest();

  const categories = ['all', ...new Set(pointsOfInterest.map(poi => poi.category))];
  
  const filteredPOIs = selectedCategory === 'all' 
    ? pointsOfInterest 
    : pointsOfInterest.filter(poi => poi.category === selectedCategory);

  const getPriceLevelDisplay = (level: number) => {
    return '$'.repeat(Math.max(1, Math.min(4, level)));
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-4 bg-muted rounded w-1/2 mx-auto mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (pointsOfInterest.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">What's Nearby</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need is just minutes away from our properties
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className="cursor-pointer px-4 py-2 text-sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category === 'all' ? 'All' : (categoryLabels[category] || category)}
            </Badge>
          ))}
        </div>

        {/* POI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPOIs.map((poi) => (
            <Card
              key={poi.id}
              className="group overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              {poi.image_url && (
                <div className="relative overflow-hidden">
                  <OptimizedImage
                    src={poi.image_url}
                    alt={poi.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="bg-background/90 text-foreground">
                      {categoryLabels[poi.category] || poi.category}
                    </Badge>
                  </div>
                </div>
              )}
              
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {poi.name}
                  </h3>
                  {poi.rating && (
                    <div className="flex items-center text-sm text-yellow-600">
                      <Star className="h-4 w-4 fill-current mr-1" />
                      <span>{poi.rating}</span>
                    </div>
                  )}
                </div>

                {poi.description && (
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                    {poi.description}
                  </p>
                )}

                <div className="space-y-2 text-sm text-muted-foreground">
                  {poi.address && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{poi.address}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    {poi.walking_time && (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{poi.walking_time} min walk</span>
                      </div>
                    )}
                    {poi.driving_time && (
                      <div className="flex items-center">
                        <Car className="h-4 w-4 mr-2" />
                        <span>{poi.driving_time} min drive</span>
                      </div>
                    )}
                  </div>

                  {poi.price_level && (
                    <div className="flex items-center justify-between">
                      <span className="text-green-600 font-medium">
                        {getPriceLevelDisplay(poi.price_level)}
                      </span>
                      {poi.distance_from_properties && (
                        <span>{poi.distance_from_properties} miles away</span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center space-x-3 pt-2">
                    {poi.phone && (
                      <a
                        href={`tel:${poi.phone}`}
                        className="flex items-center text-primary hover:text-primary/80"
                      >
                        <Phone className="h-4 w-4 mr-1" />
                        <span className="text-xs">Call</span>
                      </a>
                    )}
                    {poi.website_url && (
                      <a
                        href={poi.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-primary hover:text-primary/80"
                      >
                        <Globe className="h-4 w-4 mr-1" />
                        <span className="text-xs">Website</span>
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredPOIs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No locations found in this category.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default WhatsNearbySection;
