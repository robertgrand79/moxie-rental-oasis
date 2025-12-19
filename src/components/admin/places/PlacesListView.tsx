import React from 'react';
import { MoreVertical, Edit, Trash2, Star, MapPin, Phone, Globe, Eye, Map, CheckCircle, XCircle } from 'lucide-react';
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

interface PlacesListViewProps {
  places: Place[];
  onEdit: (place: Place) => void;
  onView: (place: Place) => void;
}

const PlacesListView = ({ places, onEdit, onView }: PlacesListViewProps) => {
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
    return status === 'published' 
      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200' 
      : 'bg-amber-500/10 text-amber-600 border-amber-200';
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
      <div className="space-y-2">
        {places.map((place) => (
          <div
            key={place.id}
            className="flex items-center gap-4 p-4 border rounded-lg bg-card hover:shadow-sm transition-shadow cursor-pointer group"
            onClick={() => onView(place)}
          >
            {/* Status indicator */}
            <div className={`w-1 h-14 rounded-full flex-shrink-0 ${
              place.status === 'published' ? 'bg-emerald-500' : 'bg-amber-500'
            }`} />

            {/* Image */}
            {place.image_url && (
              <img
                src={place.image_url}
                alt={place.name}
                className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
              />
            )}
            
            {/* Main content */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                  {place.name}
                </h3>
                <Badge variant="outline" className={getStatusColor(place.status)}>
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
                <Badge variant="secondary" className="capitalize">
                  {place.category}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {place.location_text && (
                  <div className="flex items-center">
                    <MapPin className="h-3.5 w-3.5 mr-1" />
                    <span className="truncate max-w-[200px]">{place.location_text}</span>
                  </div>
                )}
                
                {place.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                    <span>{place.rating.toFixed(1)}</span>
                  </div>
                )}

                {place.subcategory && (
                  <span className="text-xs bg-muted px-2 py-0.5 rounded">
                    {place.subcategory}
                  </span>
                )}
              </div>
            </div>
            
            {/* Actions */}
            <div 
              className="flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
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
          </div>
        ))}
      </div>
    </TooltipProvider>
  );
};

export default PlacesListView;
