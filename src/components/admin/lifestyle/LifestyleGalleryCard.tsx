
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, MapPin, Star, Sparkles } from 'lucide-react';
import { LifestyleGalleryItem } from '@/hooks/useLifestyleGallery';
import OptimizedImage from '@/components/ui/optimized-image';

interface LifestyleGalleryCardProps {
  item: LifestyleGalleryItem;
  onEdit: (item: LifestyleGalleryItem) => void;
  onDelete: (id: string) => void;
  onEnhance: (item: LifestyleGalleryItem) => void;
  isEnhancing: boolean;
  enhancingId: string | null;
}

const LifestyleGalleryCard = ({ 
  item, 
  onEdit, 
  onDelete, 
  onEnhance, 
  isEnhancing, 
  enhancingId 
}: LifestyleGalleryCardProps) => {
  return (
    <div className="border rounded-lg overflow-hidden">
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
          {!item.is_active && (
            <Badge variant="outline">Inactive</Badge>
          )}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg line-clamp-1">{item.title}</h3>
          <div className="flex items-center space-x-1 ml-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEnhance(item)}
              disabled={isEnhancing && enhancingId === item.id}
            >
              {isEnhancing && enhancingId === item.id ? (
                <Sparkles className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(item)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(item.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {item.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
        )}
        
        <div className="flex flex-wrap gap-2 mb-3">
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
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <MapPin className="h-4 w-4 mr-1" />
            {item.location}
          </div>
        )}
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Order: {item.display_order}</span>
          <span>
            {new Date(item.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LifestyleGalleryCard;
