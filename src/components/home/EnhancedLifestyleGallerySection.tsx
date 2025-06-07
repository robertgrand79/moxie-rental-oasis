
import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Camera, Search, Eye, ExternalLink } from 'lucide-react';
import OptimizedImage from '@/components/ui/optimized-image';
import { useLifestyleGallery } from '@/hooks/useLifestyleGallery';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const categoryLabels = {
  downtown: 'Downtown',
  nature: 'Nature & Outdoors',
  food: 'Food & Drink',
  events: 'Events & Culture'
};

const EnhancedLifestyleGallerySection = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAll, setShowAll] = useState(false);
  
  const { galleryItems, isLoading } = useLifestyleGallery();
  const queryClient = useQueryClient();

  // Track view mutations
  const trackView = useMutation({
    mutationFn: async (itemId: string) => {
      // Track view in analytics (placeholder for future analytics table)
      console.log(`Tracking view for lifestyle item: ${itemId}`);
    }
  });

  const categories = ['all', ...Object.keys(categoryLabels)];
  
  // Filter items based on search and category
  const filteredItems = useMemo(() => {
    let filtered = galleryItems.filter(item => item.is_active);

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    // Sort by featured first, then by display order
    filtered.sort((a, b) => {
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      return a.display_order - b.display_order;
    });

    return filtered;
  }, [galleryItems, searchTerm, selectedCategory]);

  // Show limited items initially
  const displayItems = showAll ? filteredItems : filteredItems.slice(0, 6);
  const hasMore = filteredItems.length > 6;

  const handleItemClick = (item: any) => {
    trackView.mutate(item.id);
  };

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Experience Eugene Like a Local</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the vibrant culture, outdoor adventures, and culinary delights that make Eugene special
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search experiences..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className="cursor-pointer px-4 py-2 text-sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category === 'all' ? 'All' : categoryLabels[category as keyof typeof categoryLabels]}
              </Badge>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayItems.map((item) => (
            <Card
              key={item.id}
              className="group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => handleItemClick(item)}
            >
              <div className="relative overflow-hidden">
                <OptimizedImage
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center justify-between text-white text-sm">
                      <div className="flex items-center">
                        <Camera className="h-4 w-4 mr-2" />
                        <span className="capitalize">{item.activity_type}</span>
                      </div>
                      <div className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        <span>View</span>
                      </div>
                    </div>
                  </div>
                </div>
                {item.is_featured && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-yellow-500 text-white">Featured</Badge>
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                  <Badge variant="secondary" className="text-xs ml-2">
                    {categoryLabels[item.category as keyof typeof categoryLabels]}
                  </Badge>
                </div>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {item.description}
                </p>
                {item.location && (
                  <div className="flex items-center text-gray-500 text-xs">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>{item.location}</span>
                  </div>
                )}
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
              {showAll ? 'Show Less' : `Show All ${filteredItems.length} Experiences`}
            </Button>
          </div>
        )}

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No experiences found matching your criteria.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
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

export default EnhancedLifestyleGallerySection;
