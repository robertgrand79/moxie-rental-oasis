
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { useTenantLifestyleGallery } from '@/hooks/useTenantLifestyleGallery';
import { useMutation } from '@tanstack/react-query';
import { useContentAnalytics } from '@/hooks/useContentAnalytics';
import { useTenantSettings } from '@/hooks/useTenantSettings';
import LifestyleSearchControls from './lifestyle/LifestyleSearchControls';
import LifestyleGalleryGrid from './lifestyle/LifestyleGalleryGrid';
import LifestyleGalleryLoadingState from './lifestyle/LifestyleGalleryLoadingState';
import LifestyleGalleryEmptyState from './lifestyle/LifestyleGalleryEmptyState';

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
  
  const { galleryItems, isLoading } = useTenantLifestyleGallery();
  const { trackInteraction } = useContentAnalytics();
  const { settings } = useTenantSettings();

  const sectionTitle = settings.lifestyleSectionTitle || 'Experience the Area Like a Local';
  const sectionDescription = settings.lifestyleSectionDescription || 
    'Discover the vibrant culture, outdoor adventures, and local attractions';

  // Track view mutations with enhanced metadata
  const trackView = useMutation({
    mutationFn: async (item: any) => {
      return trackInteraction.mutateAsync({
        content_type: 'lifestyle',
        content_id: item.id,
        action_type: 'view',
        metadata: {
          title: item.title,
          category: item.category,
          is_featured: item.is_featured
        }
      });
    }
  });

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
    trackView.mutate(item);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
  };

  if (isLoading) {
    return <LifestyleGalleryLoadingState />;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{sectionTitle}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {sectionDescription}
          </p>
        </div>

        <LifestyleSearchControls
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />

        <LifestyleGalleryGrid
          items={displayItems}
          onItemClick={handleItemClick}
        />

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
          <LifestyleGalleryEmptyState onClearFilters={handleClearFilters} />
        )}
      </div>
    </section>
  );
};

export default EnhancedLifestyleGallerySection;
