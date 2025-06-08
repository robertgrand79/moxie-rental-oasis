
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Camera, Eye } from 'lucide-react';
import OptimizedImage from '@/components/ui/optimized-image';

const categoryLabels = {
  downtown: 'Downtown',
  nature: 'Nature & Outdoors',
  food: 'Food & Drink',
  events: 'Events & Culture'
};

interface LifestyleGalleryCardProps {
  item: any;
  onItemClick: (item: any) => void;
}

const LifestyleGalleryCard = ({ item, onItemClick }: LifestyleGalleryCardProps) => {
  return (
    <Card
      className="group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
      onClick={() => onItemClick(item)}
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
  );
};

export default LifestyleGalleryCard;
