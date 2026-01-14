
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  MapPin, 
  Star, 
  Clock, 
  Car, 
  Phone, 
  ExternalLink, 
  Search,
  Filter,
  DollarSign
} from 'lucide-react';
import { useTenantPointsOfInterest } from '@/hooks/useTenantPointsOfInterest';
import OptimizedImage from '@/components/ui/optimized-image';

const PointsOfInterestDisplay = () => {
  const { pointsOfInterest, isLoading } = useTenantPointsOfInterest();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('rating');

  // Get unique categories from POIs
  const categories = useMemo(() => {
    const cats = ['all', ...new Set(pointsOfInterest.map(poi => poi.category))];
    return cats;
  }, [pointsOfInterest]);

  // Filter and sort POIs
  const filteredAndSortedPOIs = useMemo(() => {
    let filtered = pointsOfInterest.filter(poi => poi.is_active);

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(poi =>
        (poi.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (poi.description?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (poi.category?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(poi => poi.category === selectedCategory);
    }

    // Apply sorting
    filtered.sort((a, b) => {
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
          return 0;
      }
    });

    return filtered;
  }, [pointsOfInterest, searchTerm, selectedCategory, sortBy]);

  // Featured POIs
  const featuredPOIs = useMemo(() => {
    return pointsOfInterest.filter(poi => poi.is_featured && poi.is_active).slice(0, 3);
  }, [pointsOfInterest]);

  const getPriceLevelDisplay = (level: number) => {
    return '$'.repeat(Math.max(1, Math.min(4, level)));
  };

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-96 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Featured Points of Interest */}
      {featuredPOIs.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Recommendations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {featuredPOIs.map((poi) => (
              <Card key={poi.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="relative overflow-hidden">
                  <OptimizedImage
                    src={poi.image_url || ''}
                    alt={poi.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    fallbackIcon={true}
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-blue-600 text-white">Featured</Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">{poi.name}</h3>
                  {poi.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{poi.description}</p>
                  )}
                  
                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    {poi.rating && (
                      <div className="flex items-center">
                        <div className="flex mr-2">{getRatingStars(poi.rating)}</div>
                        <span>({poi.rating.toFixed(1)})</span>
                      </div>
                    )}
                    
                    {poi.price_level && (
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-2" />
                        <span>{getPriceLevelDisplay(poi.price_level)}</span>
                      </div>
                    )}
                    
                    {poi.distance_from_properties && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{poi.distance_from_properties.toFixed(1)} miles away</span>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    {poi.website_url && (
                      <Button size="sm" variant="outline" className="flex-1" asChild>
                        <a href={poi.website_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Visit
                        </a>
                      </Button>
                    )}
                    {poi.phone && (
                      <Button size="sm" variant="outline" className="flex-1" asChild>
                        <a href={`tel:${poi.phone}`}>
                          <Phone className="h-4 w-4 mr-1" />
                          Call
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filter Controls */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Discover Local Favorites</h2>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search places..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="rating">Sort by Rating</option>
            <option value="distance">Sort by Distance</option>
            <option value="price">Sort by Price</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>
      </div>

      {/* Points of Interest Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedPOIs.map((poi) => (
          <Card key={poi.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="relative overflow-hidden">
              <OptimizedImage
                src={poi.image_url || ''}
                alt={poi.name}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                fallbackIcon={true}
              />
              <div className="absolute top-4 left-4">
                <Badge variant="secondary" className="bg-white/90 text-gray-900">
                  {poi.category}
                </Badge>
              </div>
            </div>
            
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {poi.name}
              </h3>

              {poi.description && (
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {poi.description}
                </p>
              )}

              <div className="space-y-2 text-sm text-gray-500 mb-4">
                {poi.rating && (
                  <div className="flex items-center">
                    <div className="flex mr-2">{getRatingStars(poi.rating)}</div>
                    <span>({poi.rating.toFixed(1)})</span>
                  </div>
                )}

                {poi.price_level && (
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2" />
                    <span>{getPriceLevelDisplay(poi.price_level)}</span>
                  </div>
                )}

                {poi.address && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="truncate">{poi.address}</span>
                  </div>
                )}

                {poi.distance_from_properties && (
                  <div className="flex items-center">
                    <Car className="h-4 w-4 mr-2" />
                    <span>{poi.distance_from_properties.toFixed(1)} miles away</span>
                  </div>
                )}

                {poi.driving_time && (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{poi.driving_time} min drive</span>
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                {poi.website_url && (
                  <Button size="sm" className="flex-1" asChild>
                    <a href={poi.website_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Visit
                    </a>
                  </Button>
                )}
                {poi.phone && (
                  <Button size="sm" variant="outline" className="flex-1" asChild>
                    <a href={`tel:${poi.phone}`}>
                      <Phone className="h-4 w-4 mr-1" />
                      Call
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAndSortedPOIs.length === 0 && (
        <div className="text-center py-12">
          <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No places found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
};

export default PointsOfInterestDisplay;
