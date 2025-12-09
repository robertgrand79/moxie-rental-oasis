
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Camera } from 'lucide-react';
import OptimizedImage from '@/components/ui/optimized-image';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTenant } from '@/contexts/TenantContext';
import { useTenantSettings } from '@/hooks/useTenantSettings';

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  image_url: string;
  category: string;
  location: string;
  activity_type: string;
}

const categoryLabels = {
  downtown: 'Downtown',
  nature: 'Nature & Outdoors',
  food: 'Food & Drink',
  events: 'Events & Culture'
};

const LifestyleGallerySection = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { tenantId } = useTenant();
  const { settings } = useTenantSettings();

  // Dynamic section text from tenant settings
  const locationName = settings.heroLocationText || settings.location || 'the Area';
  const sectionTitle = settings.lifestyleSectionTitle || `Experience ${locationName} Like a Local`;
  const sectionDescription = settings.lifestyleSectionDescription || 
    `Discover the vibrant culture, outdoor adventures, and culinary delights that make ${locationName} special`;

  const { data: galleryItems = [], isLoading } = useQuery({
    queryKey: ['lifestyle-gallery', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      
      const { data, error } = await supabase
        .from('lifestyle_gallery')
        .select('*')
        .eq('is_active', true)
        .eq('organization_id', tenantId)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as GalleryItem[];
    },
    enabled: !!tenantId
  });

  const categories = ['all', ...Object.keys(categoryLabels)];
  
  const filteredItems = selectedCategory === 'all' 
    ? galleryItems 
    : galleryItems.filter(item => item.category === selectedCategory);

  if (isLoading) {
    return (
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-4 bg-muted rounded w-1/2 mx-auto mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Don't render section if no gallery items
  if (galleryItems.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">{sectionTitle}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {sectionDescription}
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
              {category === 'all' ? 'All' : categoryLabels[category as keyof typeof categoryLabels]}
            </Badge>
          ))}
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className="group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              <div className="relative overflow-hidden">
                <OptimizedImage
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center text-white text-sm">
                      <Camera className="h-4 w-4 mr-2" />
                      <span className="capitalize">{item.activity_type}</span>
                    </div>
                  </div>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <Badge variant="secondary" className="text-xs ml-2">
                    {categoryLabels[item.category as keyof typeof categoryLabels]}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                  {item.description}
                </p>
                {item.location && (
                  <div className="flex items-center text-muted-foreground text-xs">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span>{item.location}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No items found in this category.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default LifestyleGallerySection;
