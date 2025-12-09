
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Star } from 'lucide-react';
import { usePointsOfInterest } from '@/hooks/usePointsOfInterest';
import { useTenantSettings } from '@/hooks/useTenantSettings';

const LocalHighlights = () => {
  const { pointsOfInterest, isLoading } = usePointsOfInterest();
  const { settings } = useTenantSettings();
  const locationText = settings.heroLocationText || 'the Area';

  // Filter to only featured POIs and limit to 3
  const featuredHighlights = pointsOfInterest
    ?.filter(poi => poi.is_featured && poi.is_active)
    ?.slice(0, 3) || [];

  // Don't render if loading or no featured highlights
  if (isLoading) {
    return null;
  }

  if (featuredHighlights.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 mb-16">
      <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
        Local Highlights
      </h2>
      <div className="grid md:grid-cols-3 gap-8">
        {featuredHighlights.map((highlight) => (
          <Card key={highlight.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            {highlight.image_url && (
              <div className="aspect-video relative">
                <img 
                  src={highlight.image_url} 
                  alt={highlight.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-lg">{highlight.name}</CardTitle>
              {highlight.address && (
                <CardDescription className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {highlight.address}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {highlight.description && (
                <p className="text-gray-600 mb-4 text-sm line-clamp-2">{highlight.description}</p>
              )}
              
              {highlight.category && (
                <div className="mb-4">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {highlight.category}
                  </span>
                </div>
              )}

              {highlight.website_url && (
                <Button variant="outline" className="w-full" size="sm" asChild>
                  <a href={highlight.website_url} target="_blank" rel="noopener noreferrer">
                    Learn More
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LocalHighlights;
