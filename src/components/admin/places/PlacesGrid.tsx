import React from 'react';
import { MoreHorizontal, Edit, Trash2, Star, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Place, useDeletePlace } from '@/hooks/usePlaces';

interface PlacesGridProps {
  places: Place[];
  onEdit: (place: Place) => void;
}

const PlacesGrid = ({ places, onEdit }: PlacesGridProps) => {
  const deletePlace = useDeletePlace();

  const handleDelete = (place: Place) => {
    if (window.confirm(`Are you sure you want to delete "${place.name}"?`)) {
      deletePlace.mutate(place.id);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      dining: 'bg-orange-100 text-orange-800',
      outdoor: 'bg-green-100 text-green-800',
      entertainment: 'bg-purple-100 text-purple-800',
      shopping: 'bg-blue-100 text-blue-800',
      accommodation: 'bg-indigo-100 text-indigo-800',
      lifestyle: 'bg-pink-100 text-pink-800',
      general: 'bg-gray-100 text-gray-800',
    };
    return colors[category as keyof typeof colors] || colors.general;
  };

  if (places.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No places found for this category.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {places.map((place) => (
        <Card key={place.id} className="overflow-hidden">
          <div className="relative">
            {place.image_url && (
              <img
                src={place.image_url}
                alt={place.name}
                className="w-full h-48 object-cover"
              />
            )}
            {place.is_featured && (
              <div className="absolute top-2 left-2">
                <Badge className="bg-yellow-500 text-white">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              </div>
            )}
            <div className="absolute top-2 right-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="bg-white/80">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => onEdit(place)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDelete(place)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-lg truncate">{place.name}</h3>
              <Badge className={getCategoryColor(place.category)}>
                {place.category}
              </Badge>
            </div>
            
            {place.description && (
              <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                {place.description}
              </p>
            )}
            
            <div className="space-y-2">
              {place.location_text && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1" />
                  {place.location_text}
                </div>
              )}
              
              {place.rating && (
                <div className="flex items-center">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(place.rating!) 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-muted-foreground">
                    {place.rating.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <Badge variant={place.status === 'published' ? 'default' : 'secondary'}>
                {place.status}
              </Badge>
              {place.subcategory && (
                <span className="text-xs text-muted-foreground">
                  {place.subcategory}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PlacesGrid;