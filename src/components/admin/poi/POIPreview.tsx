
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Globe, Star } from 'lucide-react';
import { POIFormData } from './POIFormFields';

interface POIPreviewProps {
  item: POIFormData;
}

const POIPreview = ({ item }: POIPreviewProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {item.image_url && (
            <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
              <img
                src={item.image_url}
                alt={item.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <h3 className="text-xl font-bold">{item.name || 'POI Title'}</h3>
              <div className="flex gap-2">
                {item.is_featured && (
                  <Badge className="bg-blue-600 text-white">Featured</Badge>
                )}
                <Badge variant={item.status === 'published' ? 'default' : 'secondary'}>
                  {item.status}
                </Badge>
                {!item.is_active && (
                  <Badge variant="outline">Inactive</Badge>
                )}
              </div>
            </div>

            {item.category && (
              <Badge variant="outline" className="w-fit">
                {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
              </Badge>
            )}

            {item.description && (
              <p className="text-gray-600">{item.description}</p>
            )}

            {item.address && (
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{item.address}</span>
              </div>
            )}

            {item.phone && (
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-2" />
                <span>{item.phone}</span>
              </div>
            )}

            {item.website_url && (
              <div className="flex items-center text-sm text-gray-600">
                <Globe className="h-4 w-4 mr-2" />
                <a href={item.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Visit Website
                </a>
              </div>
            )}

            {item.rating > 0 && (
              <div className="flex items-center text-sm text-gray-600">
                <Star className="h-4 w-4 mr-2 text-yellow-500" />
                <span>{item.rating} / 5</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              {item.driving_time > 0 && (
                <div>
                  <span className="font-medium">Driving:</span> {item.driving_time} min
                </div>
              )}
              {item.walking_time > 0 && (
                <div>
                  <span className="font-medium">Walking:</span> {item.walking_time} min
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default POIPreview;
