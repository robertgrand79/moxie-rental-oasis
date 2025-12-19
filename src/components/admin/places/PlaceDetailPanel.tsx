import React from 'react';
import { X, Edit, MapPin, Phone, Globe, Star, Clock, Car, Footprints, DollarSign, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Place } from '@/hooks/usePlaces';

interface PlaceDetailPanelProps {
  place: Place;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}

const PlaceDetailPanel = ({ place, isOpen, onClose, onEdit }: PlaceDetailPanelProps) => {
  const getStatusColor = (status: string) => {
    return status === 'published' 
      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200' 
      : 'bg-amber-500/10 text-amber-600 border-amber-200';
  };

  const renderPriceLevel = (level: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4].map((i) => (
          <DollarSign 
            key={i} 
            className={`h-3 w-3 ${i <= level ? 'text-foreground' : 'text-muted-foreground/30'}`} 
          />
        ))}
      </div>
    );
  };

  const renderRating = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i <= Math.floor(rating)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-muted-foreground/30'
            }`}
          />
        ))}
        <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 flex-wrap">
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
                  <Map className="h-3 w-3 mr-1" />
                  On Map
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <SheetTitle className="text-xl text-left">{place.name}</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Image */}
          {place.image_url && (
            <div className="rounded-lg overflow-hidden">
              <img
                src={place.image_url}
                alt={place.name}
                className="w-full h-48 object-cover"
              />
            </div>
          )}

          {/* Category & Subcategory */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="capitalize">
              {place.category}
            </Badge>
            {place.subcategory && (
              <Badge variant="outline">{place.subcategory}</Badge>
            )}
            {place.activity_type && (
              <Badge variant="outline">{place.activity_type}</Badge>
            )}
          </div>

          {/* Rating & Price */}
          {(place.rating || place.price_level) && (
            <div className="flex items-center gap-4">
              {place.rating && renderRating(place.rating)}
              {place.price_level && renderPriceLevel(place.price_level)}
            </div>
          )}

          {/* Description */}
          {place.description && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Description</h4>
              <p className="text-sm">{place.description}</p>
            </div>
          )}

          <Separator />

          {/* Contact & Location Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Contact & Location</h4>
            
            {place.address && (
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span className="text-sm">{place.address}</span>
              </div>
            )}
            
            {place.location_text && (
              <div className="flex items-start gap-3">
                <Map className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span className="text-sm">{place.location_text}</span>
              </div>
            )}
            
            {place.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${place.phone}`} className="text-sm text-primary hover:underline">
                  {place.phone}
                </a>
              </div>
            )}
            
            {place.website_url && (
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <a 
                  href={place.website_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline truncate"
                >
                  {place.website_url}
                </a>
              </div>
            )}
          </div>

          {/* Coordinates */}
          {(place.latitude && place.longitude) && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Coordinates</h4>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-mono">
                    {place.latitude.toFixed(6)}, {place.longitude.toFixed(6)}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Distance & Travel Times */}
          {(place.distance_from_properties || place.walking_time || place.driving_time) && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Distance & Travel</h4>
                
                {place.distance_from_properties && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{place.distance_from_properties} miles from properties</span>
                  </div>
                )}
                
                {place.walking_time && (
                  <div className="flex items-center gap-3">
                    <Footprints className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{place.walking_time} min walk</span>
                  </div>
                )}
                
                {place.driving_time && (
                  <div className="flex items-center gap-3">
                    <Car className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{place.driving_time} min drive</span>
                  </div>
                )}
              </div>
            </>
          )}

          <Separator />

          {/* Meta Info */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Details</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-muted-foreground">Display Order</div>
              <div>{place.display_order}</div>
              <div className="text-muted-foreground">Created</div>
              <div>{new Date(place.created_at).toLocaleDateString()}</div>
              <div className="text-muted-foreground">Updated</div>
              <div>{new Date(place.updated_at).toLocaleDateString()}</div>
            </div>
          </div>

          {/* Edit Button */}
          <div className="pt-4">
            <Button onClick={onEdit} className="w-full">
              <Edit className="h-4 w-4 mr-2" />
              Edit Place
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PlaceDetailPanel;
