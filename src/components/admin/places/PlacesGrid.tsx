import React from 'react';
import { MoreVertical, Edit, Trash2, Star, MapPin, Globe, Phone, Eye, Map, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Place, useDeletePlace, useUpdatePlace } from '@/hooks/usePlaces';

interface PlacesGridProps {
  places: Place[];
  onEdit: (place: Place) => void;
  onView: (place: Place) => void;
}

const PlacesGrid = ({ places, onEdit, onView }: PlacesGridProps) => {
  const deletePlace = useDeletePlace();
  const updatePlace = useUpdatePlace();

  const handleDelete = (place: Place) => {
    if (window.confirm(`Are you sure you want to delete "${place.name}"?`)) {
      deletePlace.mutate(place.id);
    }
  };

  const handleToggleStatus = (place: Place) => {
    updatePlace.mutate({
      id: place.id,
      status: place.status === 'published' ? 'draft' : 'published',
    });
  };

  const getStatusColor = (status: string) => {
    return status === 'published' ? 'bg-emerald-500' : 'bg-amber-500';
  };

  if (places.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No places found.</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {places.map((place) => (
          <Card 
            key={place.id} 
            className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
            onClick={() => onView(place)}
          >
            {/* Status stripe */}
            <div className={`h-1 ${getStatusColor(place.status)}`} />
            
            <CardContent className="p-4 space-y-3">
              {/* Header with badges */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge 
                    variant="outline" 
                    className={place.status === 'published' 
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200' 
                      : 'bg-amber-500/10 text-amber-600 border-amber-200'
                    }
                  >
                    {place.status}
                  </Badge>
                  {place.is_featured && (
                    <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-200">
                      <Star className="h-3 w-3 mr-1 fill-current" />
                      Featured
                    </Badge>
                  )}
                  {place.show_on_map && (
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200">
                      <Map className="h-3 w-3" />
                    </Badge>
                  )}
                </div>
                <Badge variant="secondary" className="capitalize">
                  {place.category}
                </Badge>
              </div>

              {/* Image */}
              {place.image_url && (
                <div className="relative rounded-lg overflow-hidden">
                  <img
                    src={place.image_url}
                    alt={place.name}
                    className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              {/* Title */}
              <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                {place.name}
              </h3>

              {/* Location & Description */}
              <div className="space-y-1">
                {place.location_text && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                    <span className="truncate">{place.location_text}</span>
                  </div>
                )}
                {place.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {place.description}
                  </p>
                )}
              </div>

              {/* Rating */}
              {place.rating && (
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < Math.floor(place.rating!) 
                          ? 'text-yellow-400 fill-yellow-400' 
                          : 'text-muted-foreground/30'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-muted-foreground ml-1">
                    {place.rating.toFixed(1)}
                  </span>
                </div>
              )}

              {/* Footer with actions */}
              <div 
                className="flex items-center justify-between pt-3 border-t"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8"
                        disabled={!place.website_url}
                        onClick={() => place.website_url && window.open(place.website_url, '_blank')}
                      >
                        <Globe className="h-3.5 w-3.5 mr-1" />
                        Website
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {place.website_url ? 'Open website' : 'No website available'}
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8"
                        disabled={!place.phone}
                        onClick={() => place.phone && window.open(`tel:${place.phone}`, '_blank')}
                      >
                        <Phone className="h-3.5 w-3.5 mr-1" />
                        Call
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {place.phone ? `Call ${place.phone}` : 'No phone available'}
                    </TooltipContent>
                  </Tooltip>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onView(place)}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(place)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleToggleStatus(place)}>
                      {place.status === 'published' ? (
                        <>
                          <XCircle className="h-4 w-4 mr-2" />
                          Unpublish
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Publish
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleDelete(place)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </TooltipProvider>
  );
};

export default PlacesGrid;
