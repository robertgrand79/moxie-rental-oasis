
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { LifestyleGalleryItem } from '@/hooks/useLifestyleGallery';

interface LifestyleGalleryGridProps {
  galleryItems: LifestyleGalleryItem[];
  onEdit: (item: LifestyleGalleryItem) => void;
  onDelete: (id: string) => void;
}

const LifestyleGalleryGrid = ({ galleryItems, onEdit, onDelete }: LifestyleGalleryGridProps) => {
  if (galleryItems.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No lifestyle items found. Create your first item to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {galleryItems.map((item) => (
        <Card key={item.id} className="overflow-hidden">
          <div className="relative">
            {item.image_url && (
              <img
                src={item.image_url}
                alt={item.title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="absolute top-2 right-2 flex gap-1">
              {item.is_featured && (
                <Badge className="bg-blue-600 text-white">Featured</Badge>
              )}
              {!item.is_active && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <EyeOff className="h-3 w-3" />
                  Inactive
                </Badge>
              )}
            </div>
          </div>
          
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-lg truncate pr-2">{item.title}</h3>
              <div className="flex gap-1 flex-shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(item)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onDelete(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-1 mb-2">
              <Badge variant="outline">{item.category}</Badge>
              {item.activity_type && (
                <Badge variant="secondary">{item.activity_type}</Badge>
              )}
            </div>
            
            {item.description && (
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {item.description}
              </p>
            )}
            
            {item.location && (
              <p className="text-sm text-gray-500 flex items-center">
                📍 {item.location}
              </p>
            )}
            
            <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
              <span>Order: {item.display_order}</span>
              <div className="flex items-center gap-1">
                {item.is_active ? (
                  <Eye className="h-3 w-3 text-green-500" />
                ) : (
                  <EyeOff className="h-3 w-3 text-gray-400" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default LifestyleGalleryGrid;
