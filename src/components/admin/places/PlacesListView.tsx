import React from 'react';
import { MoreHorizontal, Edit, Trash2, Star, MapPin, Phone, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Place, useDeletePlace } from '@/hooks/usePlaces';

interface PlacesListViewProps {
  places: Place[];
  onEdit: (place: Place) => void;
}

const PlacesListView = ({ places, onEdit }: PlacesListViewProps) => {
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
    <div className="space-y-4">
      {places.map((place) => (
        <div
          key={place.id}
          className="flex items-center justify-between p-4 border rounded-lg bg-white hover:shadow-sm transition-shadow"
        >
          <div className="flex items-center space-x-4 flex-1">
            {place.image_url && (
              <img
                src={place.image_url}
                alt={place.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="font-semibold text-lg truncate">{place.name}</h3>
                {place.is_featured && (
                  <Badge className="bg-yellow-500 text-white">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
                <Badge className={getCategoryColor(place.category)}>
                  {place.category}
                </Badge>
                <Badge variant={place.status === 'published' ? 'default' : 'secondary'}>
                  {place.status}
                </Badge>
              </div>
              
              {place.description && (
                <p className="text-muted-foreground text-sm mb-2 line-clamp-1">
                  {place.description}
                </p>
              )}
              
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                {place.location_text && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {place.location_text}
                  </div>
                )}
                
                {place.phone && (
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-1" />
                    {place.phone}
                  </div>
                )}
                
                {place.website_url && (
                  <div className="flex items-center">
                    <Globe className="h-4 w-4 mr-1" />
                    Website
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
                    <span className="ml-1">{place.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {place.subcategory && (
              <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded">
                {place.subcategory}
              </span>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
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
      ))}
    </div>
  );
};

export default PlacesListView;