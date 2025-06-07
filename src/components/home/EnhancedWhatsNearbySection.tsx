
import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Clock, Car, Phone, Globe, Star, Search, Navigation } from 'lucide-react';
import OptimizedImage from '@/components/ui/optimized-image';
import { usePointsOfInterest } from '@/hooks/usePointsOfInterest';
import { useMutation } from '@tanstack/react-query';

const categoryLabels = {
  restaurant: 'Restaurants',
  attraction: 'Attractions',
  shopping: 'Shopping',
  outdoor: 'Outdoor Activities'
};

const EnhancedWhatsNearbySection = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('distance');
  const [showAll, setShowAll] = useState(false);

  const { pointsOfInterest, isLoading } = usePointsOfInterest();

  // Track POI interactions
  const trackPOIClick = useMutation({
    mutationFn: async ({ poiId, actionType }: { poiId: string; actionType: 'view' | 'call' | 'website' | 'directions' }) => {
      console.log(`Tracking ${actionType} for POI: ${poiId}`);
    }
  });

  const categories = ['all', ...Object.keys(categoryLabels)];
  
  // Enhanced filtering and sorting
  const filteredPOIs = useMemo(() => {
    let filtered = pointsOfInterest.filter(poi => poi.is_active);

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(poi =>
        poi.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        poi.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        poi.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        poi.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(poi => poi.category === selectedCategory);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      // Featured items first
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;

      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'distance':
          return (a.distance_from_properties || 0) - (b.distance_from_properties || 0);
        case 'price':
          return (a.price_level || 0) - (b.price_level || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return a.display_order - b.display_order;
      }
    });

    return filtered;
  }, [pointsOfInterest, searchTerm, selectedCategory, sortBy]);

  const displayPOIs = showAll ? filteredPOIs : filteredPOIs.slice(0, 6);
  const hasMore = filteredPOIs.length > 6;

  const getPriceLevelDisplay = (level: number) => {
    return '$'.repeat(Math.max(1, Math.min(4, level)));
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  const handlePOIAction = (poiId: string, actionType: 'view' | 'call' | 'website' | 'directions') => {
    trackPOIClick.mutate({ poiId, actionType });
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">What's Nearby</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need is just minutes away from our properties
          </p>
        </div>

        {/* Enhanced Search and Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search places nearby..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="distance">Sort by Distance</option>
              <option value="rating">Sort by Rating</option>
              <option value="price">Sort by Price</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>
        </div>

        {/* Featured POIs Banner */}
        {filteredPOIs.some(poi => poi.is_featured) && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Featured Recommendations</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filteredPOIs.filter(poi => poi.is_featured).slice(0, 3).map((poi) => (
                <Card key={poi.id} className="border-2 border-blue-200 bg-blue-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-blue-900">{poi.name}</h4>
                      <Badge className="bg-blue-600 text-white text-xs">Featured</Badge>
                    </div>
                    <p className="text-sm text-blue-700">{poi.category}</p>
                    {poi.rating && (
                      <div className="flex items-center mt-1">
                        <div className="flex mr-2">{getRatingStars(poi.rating)}</div>
                        <span className="text-xs text-blue-600">({poi.rating.toFixed(1)})</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* POI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayPOIs.map((poi) => (
            <Card
              key={poi.id}
              className="group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => handlePOIAction(poi.id, 'view')}
            >
              {poi.image_url && (
                <div className="relative overflow-hidden">
                  <OptimizedImage
                    src={poi.image_url}
                    alt={poi.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="bg-white/90 text-gray-900">
                      {categoryLabels[poi.category as keyof typeof categoryLabels]}
                    </Badge>
                  </div>
                  {poi.is_featured && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-yellow-500 text-white">Featured</Badge>
                    </div>
                  )}
                </div>
              )}
              
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {poi.name}
                  </h3>
                  {poi.rating && (
                    <div className="flex items-center text-sm text-yellow-600">
                      <div className="flex mr-1">{getRatingStars(poi.rating)}</div>
                      <span>({poi.rating.toFixed(1)})</span>
                    </div>
                  )}
                </div>

                {poi.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {poi.description}
                  </p>
                )}

                <div className="space-y-2 text-sm text-gray-500 mb-4">
                  {poi.address && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{poi.address}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{poi.walking_time} min walk</span>
                    </div>
                    <div className="flex items-center">
                      <Car className="h-4 w-4 mr-2" />
                      <span>{poi.driving_time} min drive</span>
                    </div>
                  </div>

                  {poi.price_level && (
                    <div className="flex items-center justify-between">
                      <span className="text-green-600 font-medium">
                        {getPriceLevelDisplay(poi.price_level)}
                      </span>
                      <span>{poi.distance_from_properties} miles away</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                  {poi.phone && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handlePOIAction(poi.id, 'call')}
                      asChild
                    >
                      <a href={`tel:${poi.phone}`}>
                        <Phone className="h-4 w-4 mr-1" />
                        Call
                      </a>
                    </Button>
                  )}
                  {poi.website_url && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handlePOIAction(poi.id, 'website')}
                      asChild
                    >
                      <a href={poi.website_url} target="_blank" rel="noopener noreferrer">
                        <Globe className="h-4 w-4 mr-1" />
                        Visit
                      </a>
                    </Button>
                  )}
                  {poi.address && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePOIAction(poi.id, 'directions')}
                      asChild
                    >
                      <a 
                        href={`https://maps.google.com/maps?q=${encodeURIComponent(poi.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Navigation className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Show More/Less Button */}
        {hasMore && (
          <div className="text-center mt-8">
            <Button
              variant="outline"
              onClick={() => setShowAll(!showAll)}
              className="px-8 py-2"
            >
              {showAll ? 'Show Less' : `Show All ${filteredPOIs.length} Places`}
            </Button>
          </div>
        )}

        {filteredPOIs.length === 0 && (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No places found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria.</p>
            <Button 
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSortBy('distance');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default EnhancedWhatsNearbySection;
