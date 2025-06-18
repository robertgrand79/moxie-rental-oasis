
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star } from 'lucide-react';
import { LifestyleGalleryItem } from '@/hooks/useLifestyleGallery';
import OptimizedImage from '@/components/ui/optimized-image';

interface LifestylePreviewProps {
  item: Partial<LifestyleGalleryItem> & {
    title: string;
    image_url: string;
    category: string;
  };
}

const LifestylePreview = ({ item }: LifestylePreviewProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* How it will appear in the gallery */}
          <div>
            <h4 className="font-medium mb-2">Gallery Card Preview</h4>
            <div className="border rounded-lg overflow-hidden max-w-sm">
              <div className="aspect-video relative">
                <OptimizedImage
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  {item.is_featured && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  {item.status === 'draft' && (
                    <Badge variant="outline">Draft</Badge>
                  )}
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-sm line-clamp-1">{item.title}</h3>
                {item.description && (
                  <p className="text-gray-600 text-xs mt-1 line-clamp-2">{item.description}</p>
                )}
                <div className="flex flex-wrap gap-1 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {item.category}
                  </Badge>
                  {item.activity_type && (
                    <Badge variant="outline" className="text-xs">
                      {item.activity_type}
                    </Badge>
                  )}
                </div>
                {item.location && (
                  <div className="flex items-center text-xs text-gray-500 mt-2">
                    <MapPin className="h-3 w-3 mr-1" />
                    {item.location}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status and metadata */}
          <div>
            <h4 className="font-medium mb-2">Item Details</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <Badge variant={item.status === 'published' ? 'default' : 'secondary'}>
                  {item.status || 'draft'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Category:</span>
                <span>{item.category}</span>
              </div>
              {item.activity_type && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Activity Type:</span>
                  <span>{item.activity_type}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Display Order:</span>
                <span>{item.display_order || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Featured:</span>
                <span>{item.is_featured ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Active:</span>
                <span>{item.is_active !== false ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LifestylePreview;
